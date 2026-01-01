'use server';

import { redirect, RedirectType } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createServerSideClient } from '@/shared/supabase/server';
import { updateFileAction, uploadFileAction } from '../file.action';
import { getUrlsFromApiResponse } from '@/shared/util/file';
import { BULLETIN_BUCKET } from '@/shared/constants/bulletin';
import type { ImageFileData } from '@/shared/types/types';
import { validateFiles } from '@/shared/util/fileValidator';
import { uploadImage } from '@/apis/upload';

export const createBulletinAction = async (formData: FormData) => {
  try {
    const title = formData.get('title')?.toString();
    const date = formData.get('date')?.toString();
    const userId = formData.get('user_id')?.toString();
    const files = formData.getAll('files').filter(Boolean) as File[];

    if (!title) return { success: false, message: '제목을 입력해주세요.' };
    if (!date) return { success: false, message: '날짜를 선택해주세요.' };
    if (!userId) return { success: false, message: '잘못된 접근입니다.' };
    if (files.length === 0) {
      return { success: false, message: '최소 한 장의 이미지를 업로드해주세요.' };
    }

    const { validFiles, errorMessage } = validateFiles([], files, 'image/*');

    if (errorMessage) {
      return { success: false, message: errorMessage };
    }

    const uploadPromises = validFiles.map((file) =>
      uploadImage({
        file,
        folder: `/bulletin/${date}`
      })
    );
    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map((res) => res.secure_url);

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
      return { success: false, message: '주보 업로드에 실패했습니다.' };
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};

export const updateBulletinAction = async (
  selectedFiles: ImageFileData[],
  state: { status: boolean; payload?: FormData; error?: string } | null | undefined,
  formData: FormData
) => {
  const bulletinId = formData.get('bulletin_id')?.toString();
  const title = formData.get('title')?.toString().trim();
  const isDisabled = formData.get('is_disabled');
  let imagefileUrls = [] as string[];
  const updatedObject = {} as UpdateObject;

  if (isDisabled) {
    return {
      status: false,
      error: '변경된 내역이 없습니다.'
    };
  }

  if (selectedFiles.length > 0) {
    const uploadPromises = selectedFiles.map((file) => updateFileAction(file));
    const uploadResults = await Promise.all(uploadPromises);
    imagefileUrls = getUrlsFromApiResponse(uploadResults);

    updatedObject.image_url = imagefileUrls;
  }

  if (title) {
    updatedObject.title = title;
  }

  try {
    const supabase = await createServerSideClient();
    const { error } = await supabase
      .from(BULLETIN_BUCKET)
      .update({ ...updatedObject })
      .eq('id', Number(bulletinId))
      .select();

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error(error);
    return {
      status: false,
      error: `주보 생성에 실패했습니다: ${error}`
    };
  }

  revalidateTag('bulletin', 'max');
  revalidatePath('/news/bulletin');
  redirect(`/news/bulletin/${bulletinId}`, RedirectType.push);
};

type UpdateObject = {
  title?: string;
  image_url?: string[];
};
