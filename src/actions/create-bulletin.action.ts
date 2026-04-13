'use server';

import { redirect } from 'next/navigation';
import { revalidatePath, updateTag } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { deleteImage } from '@/apis/cloudinary';
import { createBulletin } from '@/services/bulletin';
import { validateFiles } from '@/utils/file';
import { checkAdminPermission, uploadBulletinImages } from '@/actions/_bulletin-helpers';

export const createBulletinAction = async (formData: FormData) => {
  let uploadedPublicIds: string[] = [];

  try {
    const title = formData.get('title')?.toString().trim();
    const sundayDate = formData.get('sundayDate')?.toString();
    const files = formData.getAll('files').filter(Boolean) as File[];
    const { user, isAdmin } = await checkAdminPermission();

    if (!title) return { success: false, message: '제목을 입력해주세요.' };
    if (!sundayDate) return { success: false, message: '날짜를 선택해주세요.' };
    if (!user) return { success: false, message: '로그인이 필요합니다.' };
    if (!isAdmin) return { success: false, message: '업로드 권한이 없습니다.' };
    if (files.length === 0)
      return { success: false, message: '최소 한 장의 이미지를 업로드해주세요.' };

    const { validFiles, errorMessage } = validateFiles([], files, 'image/*');
    if (errorMessage) return { success: false, message: errorMessage };

    const uploadedImages = await uploadBulletinImages(validFiles, sundayDate);
    uploadedPublicIds = uploadedImages.map((img) => img.cloudinaryId);

    const { error } = await createBulletin({
      title,
      sundayDate,
      images: uploadedImages,
      authorId: user.id
    });

    if (error) {
      await Promise.all(uploadedPublicIds.map(deleteImage));
      return { success: false, message: '주보 업로드에 실패했습니다.' };
    }

    revalidatePath('/news/bulletins');
    revalidatePath('/news');
    updateTag('bulletin-nav');
    redirect('/news/bulletins');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    if (uploadedPublicIds.length > 0) {
      await Promise.all(uploadedPublicIds.map(deleteImage));
    }
    console.error(error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};
