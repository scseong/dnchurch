'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { createServerSideClient } from '@/shared/supabase/server';
import { BULLETIN_BUCKET } from '@/shared/constants/bulletin';
import { validateFiles } from '@/shared/util/fileValidator';
import { deleteImage, uploadImage } from '@/actions/cloudinary';
import { getUserSession } from '@/apis/auth-server';
import { updateBulletin } from '@/services/bulletin';
import { extractPublicIdFromUrl } from '@/shared/util/format';

export const createBulletinAction = async (formData: FormData) => {
  let uploadedPublicIds: string[] = [];

  try {
    const title = formData.get('title')?.toString().trim();
    const date = formData.get('date')?.toString();
    const userId = formData.get('user_id')?.toString();
    const files = formData.getAll('files').filter(Boolean) as File[];

    if (!title) return { success: false, message: '제목을 입력해주세요.' };
    if (!date) return { success: false, message: '날짜를 선택해주세요.' };
    if (!userId) return { success: false, message: '잘못된 접근입니다.' };
    if (files.length === 0)
      return { success: false, message: '최소 한 장의 이미지를 업로드해주세요.' };

    const { validFiles, errorMessage } = validateFiles([], files, 'image/*');

    if (errorMessage) {
      return { success: false, message: errorMessage };
    }

    const uploadResults = await Promise.all(
      validFiles.map(async (file) => {
        const res = await uploadImage({ file, folder: `bulletin/${date}` });
        uploadedPublicIds.push(res.public_id);
        return res;
      })
    );
    const imageUrls = uploadResults
      .map((res) => res.secure_url)
      .sort((a, b) => {
        const nameA = a.split('/').pop() || '';
        const nameB = b.split('/').pop() || '';

        return nameA.localeCompare(nameB, undefined, { numeric: true, sensitivity: 'base' });
      });

    const supabase = await createServerSideClient();
    const { error } = await supabase
      .from(BULLETIN_BUCKET)
      .insert({
        title,
        date,
        image_url: imageUrls,
        user_id: userId
      })
      .select();

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

    if (userId !== session?.id || !session?.app_metadata.is_admin) {
      return { success: false, message: '수정 권한이 없습니다.' };
    }
    if (!bulletinId) return { success: false, message: '잘못된 접근입니다.' };
    if (!title) return { success: false, message: '제목을 입력해주세요.' };
    if (!date) return { success: false, message: '날짜를 선택해주세요.' };

    const existingImagesJson = formData.get('existingImages')?.toString();
    const deletedImagesJson = formData.get('deletedImages')?.toString();

    const existingImages: string[] = existingImagesJson ? JSON.parse(existingImagesJson) : [];
    const deletedImages: string[] = deletedImagesJson ? JSON.parse(deletedImagesJson) : [];

    const retainedImages = existingImages.filter((url) => !deletedImages.includes(url));
    let newImageUrls: string[] = [];
    if (files.length > 0) {
      const uploadResults = await Promise.all(
        files.map(async (file) => {
          const res = await uploadImage({ file, folder: `bulletin/${date}` });
          newUploadedPublicIds.push(res.public_id);
          return res;
        })
      );

      newImageUrls = uploadResults.map((res) => res.secure_url);
    }
    const finalImageUrls = [...retainedImages, ...newImageUrls];

    if (finalImageUrls.length === 0) {
      if (newUploadedPublicIds.length > 0) {
        await Promise.all(newUploadedPublicIds.map(deleteImage));
      }
      return { success: false, message: '최소 한 장의 이미지가 필요합니다.' };
    }

    const { error: updateError } = await updateBulletin({
      title,
      date,
      imageUrls: finalImageUrls,
      bulletinId
    });

    if (updateError) {
      if (newUploadedPublicIds.length > 0) {
        await Promise.all(newUploadedPublicIds.map(deleteImage));
      }
      return { success: false, message: '주보 수정에 실패했습니다.' };
    }

    if (deletedImages.length > 0) {
      const publicIdsToDelete = deletedImages
        .map((url) => extractPublicIdFromUrl(url))
        .filter(Boolean) as string[];

      if (publicIdsToDelete.length > 0) {
        await Promise.all(publicIdsToDelete.map(deleteImage));
      }
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
