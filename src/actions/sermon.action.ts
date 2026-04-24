'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { createServerSideClient } from '@/lib/supabase/server';
import { createAdminServerClient } from '@/lib/supabase/admin';
import { sermonService } from '@/services/sermon/sermon-service';
import { mapFormToDbInsert, mapFormToDbUpdate } from '@/lib/sermon-form-mapper';
import { checkAdminPermission } from '@/actions/_auth-helpers';
import type { SermonFormData, SermonResourceInput } from '@/types/sermon-form';
import type { Database } from '@/types/database.types';

const RESOURCE_BUCKET = 'sermon-resources';

type ResourceRow = Database['public']['Tables']['sermon_resources']['Insert'];

// ─── 내부 업로드 헬퍼 ────────────────────────────────────────────────────────

async function uploadResourceFiles(
  resources: SermonResourceInput[]
): Promise<{ resolved: SermonResourceInput[]; paths: string[] }> {
  const adminClient = createAdminServerClient();
  const paths: string[] = [];

  const resolved = await Promise.all(
    resources.map(async (resource) => {
      if (!resource.file) return resource;

      const ext = resource.name.split('.').pop() ?? 'bin';
      const path = `${resource.id}.${ext}`;

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
    .select('id, title')
    .eq('sermon_id', sermonId)
    .is('deleted_at', null);

  const dbIds = new Set((existing ?? []).map((r) => r.id));
  const formIds = new Set(resources.map((r) => r.id));

  const toDelete = [...dbIds].filter((id) => !formIds.has(id));
  if (toDelete.length > 0) {
    await supabase
      .from('sermon_resources')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', toDelete);

    const deletedRows = (existing ?? []).filter((r) => toDelete.includes(r.id));
    const storagePaths = deletedRows.map((r) => {
      const ext = r.title.split('.').pop() ?? 'bin';
      return `${r.id}.${ext}`;
    });
    if (storagePaths.length > 0) {
      try {
        const adminClient = createAdminServerClient();
        await adminClient.storage.from(RESOURCE_BUCKET).remove(storagePaths);
      } catch (e) {
        console.error('[sync] Storage 리소스 삭제 실패', e);
      }
    }
  }

  const remainingCount = dbIds.size - toDelete.length;
  const toInsert: ResourceRow[] = resources
    .filter((r) => !dbIds.has(r.id) && r.url)
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
    const { resolved: resolvedResources, paths } = await uploadResourceFiles(data.resources);
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
    const { resolved: resolvedResources, paths } = await uploadResourceFiles(data.resources);
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
