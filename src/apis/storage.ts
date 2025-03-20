import { supabase } from '@/shared/supabase/client';
import { convertBase64ToFileName } from '@/shared/util/file';
import type { Database } from '@/shared/types/database.types';

export function getDownloadFilePath({ bucket, path }: { bucket: BucketType; path: string }) {
  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(path, {
    download: convertBase64ToFileName(path)
  });

  return publicUrl;
}

type BucketType = keyof Database['public']['Tables'];
