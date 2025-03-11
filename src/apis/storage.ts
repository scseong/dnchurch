import { supabase } from '@/shared/supabase/client';
import type { Database } from '@/shared/types/database.types';

export function getDownloadFilePath({ bucket, path }: { bucket: BucketType; path: string }) {
  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(path, {
    download: true
  });

  return publicUrl;
}

type BucketType = keyof Database['public']['Tables'];
