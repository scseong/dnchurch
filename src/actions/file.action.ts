import { decode } from 'base64-arraybuffer';
import { createServerSideClient } from '@/shared/supabase/server';
import { ImageFileData } from '@/shared/types/types';
import { extractNumbersFromString } from '@/shared/util/format';

export type UploadFileApiResponse = Awaited<ReturnType<typeof uploadFileAction>>;
export const uploadFileAction = async (file: ImageFileData) => {
  const filename = extractNumbersFromString(file.filename);
  const fileimage = file.fileimage as string;
  const base64 = fileimage.split('base64,')[1];
  const buffer = decode(base64);

  try {
    const supabase = await createServerSideClient({});
    const { data, error } = await supabase.storage.from('bulletin').upload(filename, buffer, {
      contentType: file.filetype,
      cacheControl: '3600'
    });

    if (error) {
      console.error(error);
    }

    return {
      status: true,
      data: {
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${data?.fullPath}`
      },
      error: ''
    };
  } catch (error) {
    return {
      status: false,
      error: `파일 업로드에 실패했습니다: ${error}`
    };
  }
};
