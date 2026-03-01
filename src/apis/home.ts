import { createServerSideClient } from '@/lib/supabase/server';
import { STORAGE_NAME } from '@/constants/assets';

export const getStorageImageUrl = async (filename: string) => {
  const supabase = await createServerSideClient();
  const {
    data: { publicUrl: imageUrl }
  } = supabase.storage.from(STORAGE_NAME.home).getPublicUrl(filename);

  return imageUrl;
};
