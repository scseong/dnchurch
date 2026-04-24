'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { createServerSideClient } from '@/lib/supabase/server';
import { createAdminServerClient } from '@/lib/supabase/admin';
import { sermonService } from '@/services/sermon/sermon-service';
import { mapFormToDbInsert, mapFormToDbUpdate } from '@/lib/sermon-form-mapper';
import { checkAdminPermission } from '@/actions/_auth-helpers';
import { uploadImage, deleteImage } from '@/apis/cloudinary';
import type { SermonFormData, SermonResourceInput } from '@/types/sermon-form';
import type { Database } from '@/types/database.types';

const RESOURCE_BUCKET = 'sermon-resources';

type ResourceRow = Database['public']['Tables']['sermon_resources']['Insert'];

// ─── 내부 업로드 헬퍼 ────────────────────────────────────────────────────────

async function uploadThumbnail(file: File): Promise<{ url: string; publicId: string }> {
  const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
  const result = await uploadImage({ file, folder: 'dnchurch/sermon-thumbnails', filename });
  return { url: result.secure_url, publicId: result.public_id };
}

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

async function rollbackUploads(thumbnailPublicId?: string, resourcePaths?: string[]) {
  if (thumbnailPublicId) {
    try {
      await deleteImage(thumbnailPublicId);
    } catch {}
  }
  if (resourcePaths && resourcePaths.length > 0) {
    try {
      const adminClient = createAdminServerClient();
      await adminClient.storage.from(RESOURCE_BUCKET).remove(resourcePaths);
    } catch {}
  }
}

// ─── DB 헬퍼 ─────────────────────────────────────────────────────────────────

async function insertResourcesToDb(
  supabase: Awaited<ReturnType<typeof createServerSideClient>>,
  sermonId: string,
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
    await supabase.from('sermon_resources').insert(rows);
  }
}

async function syncResourcesToDb(
  supabase: Awaited<ReturnType<typeof createServerSideClient>>,
  sermonId: string,
  resources: SermonResourceInput[]
) {
  const { data: existing } = await supabase
    .from('sermon_resources')
    .select('id')
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
    await supabase.from('sermon_resources').insert(toInsert);
  }
}

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function createSermonAction(
  data: SermonFormData,
  thumbnailFile?: File
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  let thumbnailPublicId: string | undefined;
  let resourcePaths: string[] = [];

  try {
    let thumbnailUrl = data.thumbnailUrl;
    if (thumbnailFile) {
      const uploaded = await uploadThumbnail(thumbnailFile);
      thumbnailUrl = uploaded.url;
      thumbnailPublicId = uploaded.publicId;
    }

    const { resolved: resolvedResources, paths } = await uploadResourceFiles(data.resources);
    resourcePaths = paths;

    const supabase = await createServerSideClient();
    const result = await sermonService(supabase).createSermon(
      mapFormToDbInsert({ ...data, thumbnailUrl })
    );
    if (!result.data) throw new Error('sermon insert failed');

    await insertResourcesToDb(supabase, result.data.id, resolvedResources);

    updateTag('sermon');
    redirect(`/admin/sermons/${result.data.slug}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    await rollbackUploads(thumbnailPublicId, resourcePaths);
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}

export async function updateSermonAction(
  id: string,
  data: SermonFormData,
  thumbnailFile?: File
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  let thumbnailPublicId: string | undefined;
  let resourcePaths: string[] = [];

  try {
    let thumbnailUrl = data.thumbnailUrl;
    if (thumbnailFile) {
      const uploaded = await uploadThumbnail(thumbnailFile);
      thumbnailUrl = uploaded.url;
      thumbnailPublicId = uploaded.publicId;
    }

    const { resolved: resolvedResources, paths } = await uploadResourceFiles(data.resources);
    resourcePaths = paths;

    const supabase = await createServerSideClient();
    await sermonService(supabase).updateSermon(id, mapFormToDbUpdate({ ...data, thumbnailUrl }));
    await syncResourcesToDb(supabase, id, resolvedResources);

    updateTag('sermon');
    return { success: true, message: '저장되었습니다.' };
  } catch (error) {
    await rollbackUploads(thumbnailPublicId, resourcePaths);
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}

export async function deleteSermonAction(
  id: string
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
