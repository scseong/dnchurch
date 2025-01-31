import { createServerSideClient } from '@/shared/supabase/server';
import { generateFileName } from '@/shared/util/file';

export const uploadFileAction = async (file: File) => {
  const filename = generateFileName(file.name);

  if (!filename)
    return {
      status: false,
      error: '파일 이름을 확인해주세요. 예시) 주보원고 250101'
    };

  try {
    const supabase = await createServerSideClient();
    const { data: uploadData } = await supabase.storage
      .from('bulletin')
      .upload(filename, file, { cacheControl: '3600', upsert: true });

    return {
      status: true,
      data: {
        url: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${uploadData?.fullPath}`
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
