'use server';

import { redirect } from 'next/navigation';
import { updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { createServerSideClient } from '@/lib/supabase/server';
import { sermonService } from '@/services/sermon/sermon-service';
import { mapFormToDbInsert, mapFormToDbUpdate } from '@/lib/sermon-form-mapper';
import { checkAdminPermission } from '@/actions/_auth-helpers';
import { uploadImage } from '@/apis/cloudinary';
import type { SermonFormData } from '@/types/sermon-form';

export async function createSermonAction(
  data: SermonFormData
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  try {
    const supabase = await createServerSideClient();
    const result = await sermonService(supabase).createSermon(mapFormToDbInsert(data));
    if (!result.data) return { success: false, message: '저장에 실패했습니다.' };

    updateTag('sermon');
    redirect(`/admin/sermons/${result.data.slug}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}

export async function updateSermonAction(
  id: string,
  data: SermonFormData
): Promise<{ success: boolean; message: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  try {
    const supabase = await createServerSideClient();
    await sermonService(supabase).updateSermon(id, mapFormToDbUpdate(data));

    updateTag('sermon');
    return { success: true, message: '저장되었습니다.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
}

export async function uploadSermonThumbnailAction(
  file: File
): Promise<{ success: boolean; url?: string; message?: string }> {
  const { user, isAdmin } = await checkAdminPermission();
  if (!user) return { success: false, message: '로그인이 필요합니다.' };
  if (!isAdmin) return { success: false, message: '권한이 없습니다.' };

  try {
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const result = await uploadImage({ file, folder: 'dnchurch/sermon-thumbnails', filename });
    return { success: true, url: result.secure_url };
  } catch {
    return { success: false, message: '업로드에 실패했습니다.' };
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
