import { decode } from 'base64-arraybuffer';
import { createServerSideClient } from '@/shared/supabase/server';
import { ImageFileData } from '@/shared/types/types';
import { convertFileNameToBase64 } from '@/shared/util/file';
import { BULLETIN_BUCKET } from '@/shared/constants/bulletin';

export type UploadFileApiResponse = Awaited<ReturnType<typeof uploadFileAction>>;
export const uploadFileAction = async (file: ImageFileData) => {
  const filename = convertFileNameToBase64(file.filename);
  const fileimage = file.fileimage as string;
  const base64 = fileimage.split('base64,')[1];
  const buffer = decode(base64);

  try {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase.storage.from(BULLETIN_BUCKET).upload(filename, buffer, {
      contentType: file.filetype
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

export const updateFileAction = async (file: ImageFileData) => {
  const filename = convertFileNameToBase64(file.filename) + `?updated=${new Date().getTime()}`;
  const fileimage = file.fileimage as string;
  const base64 = fileimage.split('base64,')[1];
  const buffer = decode(base64);

  try {
    const supabase = await createServerSideClient();
    const { data, error } = await supabase.storage.from(BULLETIN_BUCKET).update(filename, buffer, {
      contentType: file.filetype
    });

    if (error) {
      console.error(error);
    }

    return {
      status: true,
      data: {
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bulletin/${data?.path}`
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
