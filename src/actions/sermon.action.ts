'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { createServerSideClient } from '@/lib/supabase/server';
import { createAdminServerClient } from '@/lib/supabase/admin';
import { sermonService } from '@/services/sermon/sermon-service';
import { mapFormToDbInsert, mapFormToDbUpdate } from '@/lib/sermon-form-mapper';
import { checkAdminPermission } from '@/actions/_auth-helpers';
import { formattedDate } from '@/utils/date';
import type { SermonFormData, SermonResourceInput } from '@/types/sermon-form';
import type { Database } from '@/types/database.types';

const RESOURCE_BUCKET = 'sermon-resources';

type ResourceRow = Database['public']['Tables']['sermon_resources']['Insert'];

// ─── 내부 업로드 헬퍼 ────────────────────────────────────────────────────────

function buildResourcePath(sermonDate: string, originalName: string): string {
  const folder = formattedDate(sermonDate, 'YYYY/MM');
  const ext = originalName.split('.').pop() ?? 'bin';
  const baseName = originalName.replace(/\.[^.]+$/, '');
  const sanitized =
    baseName
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') || 'file';
  return `${folder}/${sanitized}-${Date.now()}.${ext}`;
}

function extractStoragePath(fileUrl: string): string | null {
  const marker = `/public/${RESOURCE_BUCKET}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(fileUrl.substring(idx + marker.length));
}

async function uploadResourceFiles(
  resources: SermonResourceInput[],
  sermonDate: string
): Promise<{ resolved: SermonResourceInput[]; paths: string[] }> {
  const adminClient = createAdminServerClient();
  const paths: string[] = [];

  const resolved = await Promise.all(
    resources.map(async (resource) => {
      if (!resource.file) return resource;

      const path = buildResourcePath(sermonDate, resource.name);

      const { error } = await adminClient.storage
        .from(RESOURCE_BUCKET)
        .upload(path, resource.file, { upsert: false });

      if (error) throw error;

      paths.push(path);
      const {
        data: { publicUrl }
      } = adminClient.storage.from(RESOURCE_BUCKET).getPublicUrl(path);

      const { file: _, ...rest } = resource;
      return { ...rest, url: publicUrl };
    })
  );

  return { resolved, paths };
}

async function rollbackUploads(resourcePaths?: string[]) {
  if (resourcePaths && resourcePaths.length > 0) {
    try {
      const adminClient = createAdminServerClient();
      await adminClient.storage.from(RESOURCE_BUCKET).remove(resourcePaths);
    } catch (e) {
      console.error('[rollback] Storage 리소스 삭제 실패', e);
    }
  }
}

// ─── DB 헬퍼 ─────────────────────────────────────────────────────────────────

async function insertResourcesToDb(
  supabase: Awaited<ReturnType<typeof createServerSideClient>>,
  sermonId: number,
  resources: SermonResourceInput[]
) {
  const rows: ResourceRow[] = resources
    .filter((r) => r.url)
    .map((r, index) => ({
      id: r.id,
      sermon_id: sermonId,
      title: r.name,
      file_url: r.url!,
      file_type: r.fileType as ResourceRow['file_type'],
      file_size_bytes: r.size,
      sort_order: index + 1
    }));

  if (rows.length > 0) {
    const { error } = await supabase.from('sermon_resources').insert(rows);
    if (error) throw error;
  }
}

async function syncResourcesToDb(
  supabase: Awaited<ReturnType<typeof createServerSideClient>>,
  sermonId: number,
  resources: SermonResourceInput[]
) {
  const { data: existing } = await supabase
    .from('sermon_resources')
    .select('id, file_url')
    .eq('sermon_id', sermonId)
    .is('deleted_at', null);

  const existingRows = existing ?? [];
  const formIds = new Set(resources.map((r) => r.id));

  // 삭제 대상: DB에 있으나 폼에 없는 것 — 단일 패스로 id/경로 동시 수집
  const toDelete: string[] = [];
  const pathsToDelete: string[] = [];
  for (const row of existingRows) {
    if (formIds.has(row.id)) continue;
    toDelete.push(row.id);
    const path = extractStoragePath(row.file_url);
    if (path) pathsToDelete.push(path);
  }

  if (toDelete.length > 0) {
    await supabase
      .from('sermon_resources')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', toDelete);

    if (pathsToDelete.length > 0) {
      try {
        const adminClient = createAdminServerClient();
        await adminClient.storage.from(RESOURCE_BUCKET).remove(pathsToDelete);
      } catch (e) {
        console.error('[sync] Storage 리소스 삭제 실패', e);
      }
    }
  }

  const existingIds = new Set(existingRows.map((r) => r.id));
  const remainingCount = existingRows.length - toDelete.length;
  const toInsert: ResourceRow[] = resources
    .filter((r) => !existingIds.has(r.id) && r.url)
    .map((r, index) => ({
      id: r.id,
      sermon_id: sermonId,
      title: r.name,
      file_url: r.url!,
      file_type: r.fileType as ResourceRow['file_type'],
      file_size_bytes: r.size,
      sort_order: remainingCount + index + 1
    }));

  if (toInsert.length > 0) {
    const { error } = await supabase.from('sermon_resources').insert(toInsert);
    if (error) throw error;
  }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function createSermonAction(
  data: SermonFormData
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  if (!data.title || !data.sermonDate || !data.preacherId || !data.serviceType) {
    return { success: false, message: '필수 항목(제목, 날짜, 설교자, 예배 종류)을 입력해주세요.' };
  }

  let resourcePaths: string[] = [];

  try {
    const { resolved: resolvedResources, paths } = await uploadResourceFiles(data.resources, data.sermonDate);
    resourcePaths = paths;

    const supabase = await createServerSideClient();
    const result = await sermonService(supabase).createSermon(mapFormToDbInsert(data));
    if (!result.data) throw new Error('sermon insert failed');

    await insertResourcesToDb(supabase, result.data.id, resolvedResources);

    updateTag('sermon');
    redirect(`/admin/sermons/${result.data.id}/edit`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    await rollbackUploads(resourcePaths);
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}

export async function updateSermonAction(
  id: number,
  data: SermonFormData
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  if (!data.title || !data.sermonDate || !data.preacherId || !data.serviceType) {
    return { success: false, message: '필수 항목(제목, 날짜, 설교자, 예배 종류)을 입력해주세요.' };
  }

  let resourcePaths: string[] = [];

  try {
    const { resolved: resolvedResources, paths } = await uploadResourceFiles(data.resources, data.sermonDate);
    resourcePaths = paths;

    const supabase = await createServerSideClient();
    await sermonService(supabase).updateSermon(id, mapFormToDbUpdate(data));
    await syncResourcesToDb(supabase, id, resolvedResources);

    updateTag('sermon');
    return { success: true, message: '저장되었습니다.' };
  } catch (error) {
    await rollbackUploads(resourcePaths);
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}

export async function deleteSermonAction(
  id: number
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  try {
    const supabase = await createServerSideClient();
    await sermonService(supabase).softDeleteSermon(id);

    updateTag('sermon');
    redirect('/admin/sermons');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}
