import { supabase } from '@/shared/supabase/client';
import { extractFilename, getDownloadFilename } from '@/shared/util/file';
import type { Database } from '@/shared/types/database.types';

export function getDownloadFilePath({ bucket, path }: { bucket: BucketType; path: string }) {
  const filename = extractFilename(path);
  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(path, {
    download: getDownloadFilename(filename)
  });

  return publicUrl;
}

type BucketType = keyof Database['public']['Tables'];
