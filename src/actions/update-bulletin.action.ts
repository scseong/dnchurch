'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { deleteImage } from '@/apis/cloudinary';
import { getBulletinByIdSSR, updateBulletin } from '@/services/bulletin';
import { validateFiles } from '@/utils/file';
import { checkAdminPermission, uploadBulletinImages } from '@/actions/_bulletin-helpers';
import type { BulletinImageInput, ExistingImageItem } from '@/types/bulletin';

export const updateBulletinAction = async (formData: FormData) => {
  let newUploadedPublicIds: string[] = [];

  try {
    const bulletinId = formData.get('bulletinId')?.toString();
    const title = formData.get('title')?.toString().trim();
    const sundayDate = formData.get('sundayDate')?.toString();
    const authorId = formData.get('authorId')?.toString();
    const files = formData.getAll('files').filter(Boolean) as File[];
    const { user, isAdmin } = await checkAdminPermission();

    if (!user) return { success: false, message: '로그인이 필요합니다.' };
    if (!isAdmin && authorId !== user.id)
      return { success: false, message: '수정 권한이 없습니다.' };
    if (!bulletinId) return { success: false, message: '잘못된 접근입니다.' };
    if (!title) return { success: false, message: '제목을 입력해주세요.' };
    if (!sundayDate) return { success: false, message: '날짜를 선택해주세요.' };

    const existingImagesJson = formData.get('existingImages')?.toString();
    const deletedImagesJson = formData.get('deletedImages')?.toString();

    const existingImages: ExistingImageItem[] = existingImagesJson
      ? JSON.parse(existingImagesJson)
      : [];
    const deletedImages: Pick<ExistingImageItem, 'imageId' | 'cloudinaryId'>[] = deletedImagesJson
      ? JSON.parse(deletedImagesJson)
      : [];

    const imageIdsToDelete = deletedImages.map((img) => Number(img.imageId));
    const retainedCount = existingImages.filter(
      (img) => !imageIdsToDelete.includes(img.imageId)
    ).length;

    // 삭제할 Cloudinary id는 폼이 보낸 값이 아니라 해당 주보에 실제 속한 이미지로 한정한다.
    // 폼 값을 그대로 믿으면 다른 주보의 cloudinary_id를 섞어 보내 그 원본을 지울 수 있다.
    let cloudinaryIdsToDelete: string[] = [];
    if (imageIdsToDelete.length > 0) {
      const { data: current } = await getBulletinByIdSSR(bulletinId);
      cloudinaryIdsToDelete = (current?.bulletin_images ?? [])
        .filter((img) => imageIdsToDelete.includes(img.id))
        .map((img) => img.cloudinary_id);
    }

    let newImages: BulletinImageInput[] = [];
    if (files.length > 0) {
      const { validFiles, errorMessage } = validateFiles([], files, 'image/*');
      if (errorMessage) return { success: false, message: errorMessage };

      const uploaded = await uploadBulletinImages(validFiles, sundayDate, retainedCount);
      newUploadedPublicIds = uploaded.map((img) => img.cloudinaryId);
      newImages = uploaded;
    }

    if (existingImages.length + newImages.length === 0) {
      if (newUploadedPublicIds.length > 0) {
        await Promise.all(newUploadedPublicIds.map(deleteImage));
      }
      return { success: false, message: '최소 한 장의 이미지가 필요합니다.' };
    }

    const { error: updateError } = await updateBulletin({
      bulletinId,
      title,
      sundayDate,
      imagesToAdd: newImages,
      imageIdsToDelete
    });

    if (updateError) {
      if (newUploadedPublicIds.length > 0) {
        await Promise.all(newUploadedPublicIds.map(deleteImage));
      }
      return { success: false, message: '주보 수정에 실패했습니다.' };
    }

    if (cloudinaryIdsToDelete.length > 0) {
      await Promise.all(cloudinaryIdsToDelete.map(deleteImage));
    }

    revalidatePath('/news/bulletins');
    revalidatePath('/news');
    updateTag('bulletin-detail');
    updateTag('bulletin-detail-nav');
    redirect(`/news/bulletins/${bulletinId}`);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (newUploadedPublicIds.length > 0) {
      await Promise.all(newUploadedPublicIds.map(deleteImage));
    }
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};
