'use server';

// import { redirect, RedirectType } from 'next/navigation';
// import { createServerSideClient } from '@/shared/supabase/server';
// import { uploadFileAction } from '../file.action';
// import { getUrlsFromApiResponse } from '@/shared/util/file';
import type { ImageFileData } from '@/shared/types/types';

export const createBulletinAction = async (
  selectedFile: ImageFileData[],
  state: { status: boolean; error: string } | null | undefined,
  formData: FormData
) => {
  for (const file of selectedFile) {
    console.log(file.filename);
  }

  const title = formData.get('title')?.toString().trim();
  const user_id = formData.get('user_id')?.toString();

  if (!title || !selectedFile.length || !user_id)
    return {
      status: false,
      payload: formData,
      error: '모든 항목을 작성해주세요.'
    };

  return {
    status: true,
    payload: formData,
    error: ''
  };

  // const uploadPromises = image_url.map((file) => uploadFileAction(file));
  // const uploadResults = await Promise.all(uploadPromises);
  // const imagefileUrls = getUrlsFromApiResponse(uploadResults);

  // try {
  //   const supabase = await createServerSideClient({});
  //   const { error } = await supabase
  //     .from('bulletin')
  //     .insert({
  //       title,
  //       image_url: imagefileUrls,
  //       user_id
  //     })
  //     .select();

  //   if (error) {
  //     throw new Error(error.message);
  //   }
  // } catch (error) {
  //   console.error(error);
  //   return {
  //     status: false,
  //     error: `주보 생성에 실패했습니다: ${error}`
  //   };
  // }

  // // TODO: Error Handling
  // redirect('/news/bulletin', RedirectType.push);
};
