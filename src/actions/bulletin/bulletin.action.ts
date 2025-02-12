'use server';

import { redirect, RedirectType } from 'next/navigation';
import { createServerSideClient } from '@/shared/supabase/server';
import { uploadFileAction } from '../file.action';
import { getUrlsFromApiResponse } from '@/shared/util/file';

export const createBulletinAction = async (_: unknown, formData: FormData) => {
  const title = formData.get('title')?.toString();
  const image_url = formData.getAll('image_url') as File[];
  const user_id = formData.get('user_id')?.toString();

  if (!title || !image_url.length || !user_id)
    return {
      status: false,
      error: '모든 항목을 작성해주세요.'
    };

  const uploadPromises = image_url.map((file) => uploadFileAction(file));
  const uploadResults = await Promise.all(uploadPromises);
  const imagefileUrls = getUrlsFromApiResponse(uploadResults);

  try {
    const supabase = await createServerSideClient();
    const { error } = await supabase
      .from('bulletin')
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

  // TODO: Error Handling
  redirect('/news/bulletin', RedirectType.push);
};
