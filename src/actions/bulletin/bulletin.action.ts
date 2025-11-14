'use server';

import { redirect, RedirectType } from 'next/navigation';
import { revalidatePath, revalidateTag } from 'next/cache';
import { createServerSideClient } from '@/shared/supabase/server';
import { updateFileAction, uploadFileAction } from '../file.action';
import { getUrlsFromApiResponse } from '@/shared/util/file';
import { BULLETIN_BUCKET } from '@/shared/constants/bulletin';
import type { ImageFileData } from '@/shared/types/types';

export const createBulletinAction = async (
  selectedFiles: ImageFileData[],
  state: { status: boolean; payload?: FormData; error?: string } | null | undefined,
  formData: FormData
) => {
  const title = formData.get('title')?.toString().trim();
  const user_id = formData.get('user_id')?.toString();

  if (!title || !selectedFiles.length || !user_id)
    return {
      status: false,
      payload: formData,
      error: '모든 항목을 작성해주세요.'
    };

  const uploadPromises = selectedFiles.map((file) => uploadFileAction(file));
  const uploadResults = await Promise.all(uploadPromises);
  const imagefileUrls = getUrlsFromApiResponse(uploadResults);

  try {
    const supabase = await createServerSideClient({});
    const { error } = await supabase
      .from(BULLETIN_BUCKET)
      .insert({
        title,
        image_url: imagefileUrls,
        user_id
      })
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

  revalidatePath('/news');
  revalidatePath('/news/bulletin');
  redirect('/news/bulletin', RedirectType.push);
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
    const supabase = await createServerSideClient({});
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
