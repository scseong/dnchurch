'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { deleteImage, uploadImage } from '@/apis/cloudinary';
import { getUserSession } from '@/apis/auth-server';
import { createBulletin, updateBulletin } from '@/services/bulletin';
import { validateFiles } from '@/utils/file';
import { formattedDate } from '@/utils/date';

export const createBulletinAction = async (formData: FormData) => {
  let uploadedPublicIds: string[] = [];

  try {
    const title = formData.get('title')?.toString().trim();
    const date = formData.get('date')?.toString();
    const files = formData.getAll('files').filter(Boolean) as File[];
    const session = await getUserSession();

    if (!title) return { success: false, message: '제목을 입력해주세요.' };
    if (!date) return { success: false, message: '날짜를 선택해주세요.' };
    if (!session?.app_metadata.is_admin)
      return { success: false, message: '업로드 권한이 없습니다.' };
    if (files.length === 0)
      return { success: false, message: '최소 한 장의 이미지를 업로드해주세요.' };

    const { validFiles, errorMessage } = validateFiles([], files, 'image/*');

    if (errorMessage) {
      return { success: false, message: errorMessage };
    }

    const uploadResults = await uploadBulletinImages(validFiles, date);

    const { error } = await createBulletin({
      title,
      date,
      imageUrls: uploadResults,
      userId: session.id
    });

    if (error) {
      const deletePromises = uploadedPublicIds.map(deleteImage);
      await Promise.all(deletePromises);
      return { success: false, message: '주보 업로드에 실패했습니다.' };
    }

    revalidatePath('/news/bulletin');
    revalidatePath('/news');
    updateTag('bulletin-nav');
    redirect('/news/bulletin');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (uploadedPublicIds.length > 0) {
      await Promise.all(uploadedPublicIds.map(deleteImage));
    }
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};

export const updateBulletinAction = async (formData: FormData) => {
  let newUploadedPublicIds: string[] = [];

  try {
    const bulletinId = formData.get('bulletinId')?.toString();
    const title = formData.get('title')?.toString().trim();
    const date = formData.get('date')?.toString();
    const userId = formData.get('userId')?.toString();
    const files = formData.getAll('files').filter(Boolean) as File[];
    const session = await getUserSession();

    if (!session?.app_metadata.is_admin && userId !== session?.id) {
      return { success: false, message: '수정 권한이 없습니다.' };
    }
    if (!bulletinId) return { success: false, message: '잘못된 접근입니다.' };
    if (!title) return { success: false, message: '제목을 입력해주세요.' };
    if (!date) return { success: false, message: '날짜를 선택해주세요.' };

    const existingImagesJson = formData.get('existingImages')?.toString();
    const deletedImagesJson = formData.get('deletedImages')?.toString();

    const existingPublicIds: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];
    const deletedPublicIds: string[] = deletedImagesJson ? JSON.parse(deletedImagesJson) : [];

    const retainedPublicIds = existingPublicIds.filter((id) => !deletedPublicIds.includes(id));

    let newPublicIds: string[] = [];
    if (files.length > 0) {
      const { validFiles, errorMessage } = validateFiles([], files, 'image/*');
      if (errorMessage) return { success: false, message: errorMessage };

      newPublicIds = await uploadBulletinImages(validFiles, date);
    }

    const finalPublicIds = [...retainedPublicIds, ...newPublicIds];

    if (finalPublicIds.length === 0) {
      if (newUploadedPublicIds.length > 0) {
        await Promise.all(newUploadedPublicIds.map(deleteImage));
      }
      return { success: false, message: '최소 한 장의 이미지가 필요합니다.' };
    }

    const { error: updateError } = await updateBulletin({
      title,
      date,
      imageUrls: finalPublicIds,
      bulletinId
    });

    if (updateError) {
      if (newUploadedPublicIds.length > 0) {
        await Promise.all(newUploadedPublicIds.map(deleteImage));
      }
      return { success: false, message: '주보 수정에 실패했습니다.' };
    }

    if (deletedPublicIds.length > 0) {
      await Promise.all(deletedPublicIds.map(deleteImage));
    }

    revalidatePath('/news/bulletin');
    revalidatePath('/news');
    updateTag('bulletin-detail');
    updateTag('bulletin-detail-nav');
    redirect(`/news/bulletin/${bulletinId}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (newUploadedPublicIds.length > 0) {
      await Promise.all(newUploadedPublicIds.map(deleteImage));
    }
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};

async function uploadBulletinImages(files: File[], date: string) {
  const folderDate = formattedDate(date, 'YYYY/MM/DD');
  const results = await Promise.all(
    files.map((file) => uploadImage({ file, folder: `bulletin/${folderDate}` }))
  );
  return results.map((res) => res.public_id);
}
