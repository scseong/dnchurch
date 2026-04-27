'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { createServerSideClient } from '@/lib/supabase/server';
import { createAdminServerClient } from '@/lib/supabase/admin';
import { sermonService, type SermonResourceRpcInput } from '@/services/sermon/sermon-service';
import { mapFormToDbInsert, mapFormToDbUpdate } from '@/lib/sermon-form-mapper';
import { checkAdminPermission } from '@/actions/_auth-helpers';
import { extractStoragePath, RESOURCE_BUCKET } from '@/lib/sermon-resource';
import { formattedDate } from '@/utils/date';
import type { SermonFormData, SermonResourceInput } from '@/types/sermon-form';

// ─── Storage 헬퍼 ────────────────────────────────────────────────────────────

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

async function uploadResourceFiles(
  resources: SermonResourceInput[],
  sermonDate: string
): Promise<{ resolved: SermonResourceInput[]; paths: string[] }> {
  const adminClient = createAdminServerClient();

  // allSettled로 일괄 시도 → 부분 실패 시에도 성공한 모든 path를 정확히 수집하여 cleanup
  const results = await Promise.allSettled(
    resources.map(
      async (
        resource
      ): Promise<{ resource: SermonResourceInput; path: string | null }> => {
        if (!resource.file) return { resource, path: null };

        const path = buildResourcePath(sermonDate, resource.name);

        const { error } = await adminClient.storage
          .from(RESOURCE_BUCKET)
          .upload(path, resource.file, { upsert: false });

        if (error) throw error;

        const {
          data: { publicUrl }
        } = adminClient.storage.from(RESOURCE_BUCKET).getPublicUrl(path);

        const { file: _, ...rest } = resource;
        return { resource: { ...rest, url: publicUrl }, path };
      }
    )
  );

  const resolved: SermonResourceInput[] = [];
  const uploadedPaths: string[] = [];
  let failure: unknown;

  for (const r of results) {
    if (r.status === 'fulfilled') {
      resolved.push(r.value.resource);
      if (r.value.path) uploadedPaths.push(r.value.path);
    } else if (failure === undefined) {
      failure = r.reason;
    }
  }

  if (failure !== undefined) {
    await removeStorageObjects(uploadedPaths);
    throw failure;
  }

  return { resolved, paths: uploadedPaths };
}

async function removeStorageObjects(paths: string[]) {
  if (paths.length === 0) return;
  try {
    const adminClient = createAdminServerClient();
    await adminClient.storage.from(RESOURCE_BUCKET).remove(paths);
  } catch (e) {
    console.error('[storage] 리소스 삭제 실패', e);
  }
}

function pathsFromUrls(urls: string[]): string[] {
  return urls.map(extractStoragePath).filter((p): p is string => p !== null);
}

// ─── 매핑 헬퍼 ────────────────────────────────────────────────────────────────

function toRpcResource(resource: SermonResourceInput): SermonResourceRpcInput {
  return {
    id: resource.id,
    title: resource.name,
    file_url: resource.url!,
    file_type: resource.fileType,
    file_size_bytes: resource.size || null
  };
}

// ─── Server Actions ───────────────────────────────────────────────────────────

export async function createSermonAction(
  sermonFormData: SermonFormData
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  if (
    !sermonFormData.title ||
    !sermonFormData.sermonDate ||
    !sermonFormData.preacherId ||
    !sermonFormData.serviceType
  ) {
    return { success: false, message: '필수 항목(제목, 날짜, 설교자, 예배 종류)을 입력해주세요.' };
  }

  let resourcePaths: string[] = [];

  try {
    const { resolved, paths } = await uploadResourceFiles(
      sermonFormData.resources,
      sermonFormData.sermonDate
    );
    resourcePaths = paths;

    const rpcResources = resolved.filter((r) => r.url).map(toRpcResource);

    const supabase = await createServerSideClient();
    const result = await sermonService(supabase).createSermon(
      mapFormToDbInsert(sermonFormData),
      rpcResources
    );
    if (result.error) throw result.error;
    if (!result.data) throw new Error('create_sermon RPC returned no data');

    updateTag('sermon');
    redirect(`/admin/sermons/${result.data.id}/edit`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    await removeStorageObjects(resourcePaths);
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}

export async function updateSermonAction(
  id: number,
  sermonFormData: SermonFormData
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  if (
    !sermonFormData.title ||
    !sermonFormData.sermonDate ||
    !sermonFormData.preacherId ||
    !sermonFormData.serviceType
  ) {
    return { success: false, message: '필수 항목(제목, 날짜, 설교자, 예배 종류)을 입력해주세요.' };
  }

  // 신규 업로드 대상(file 있는 것)과 기존 보존 대상(url만 있는 것)을 분리
  const newCandidates = sermonFormData.resources.filter((r) => r.file);
  const keepResourceIds = sermonFormData.resources
    .filter((r) => !r.file && r.url)
    .map((r) => r.id);

  let newResourcePaths: string[] = [];

  try {
    const { resolved, paths } = await uploadResourceFiles(
      newCandidates,
      sermonFormData.sermonDate
    );
    newResourcePaths = paths;

    const rpcNewResources = resolved.filter((r) => r.url).map(toRpcResource);

    const supabase = await createServerSideClient();
    const result = await sermonService(supabase).updateSermon(
      id,
      mapFormToDbUpdate(sermonFormData),
      keepResourceIds,
      rpcNewResources
    );
    if (result.error) throw result.error;

    const payload = result.data as unknown as { sermon: unknown; deleted_urls: string[] } | null;
    const deletedUrls = payload?.deleted_urls ?? [];
    await removeStorageObjects(pathsFromUrls(deletedUrls));

    updateTag('sermon');
    return { success: true, message: '저장되었습니다.' };
  } catch (error) {
    await removeStorageObjects(newResourcePaths);
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
    const result = await sermonService(supabase).softDeleteSermon(id);
    if (result.error) throw result.error;

    const urls = result.data ?? [];
    await removeStorageObjects(pathsFromUrls(urls));

    updateTag('sermon');
    redirect('/admin/sermons');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}
