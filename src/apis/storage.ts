// --- IGNORE ---
import { supabase } from '@/shared/supabase/client';
import { getFilenameFromUrl } from '@/shared/util/file';
import type { Database } from '@/shared/types/database.types';

export function getDownloadFilePath({ bucket, path }: { bucket: BucketType; path: string }) {
  const filename = getFilenameFromUrl(path);
  const {
    data: { publicUrl }
  } = supabase.storage.from(bucket).getPublicUrl(path, {
    download: decodeURIComponent(filename)
  });

  return publicUrl;
}

type BucketType = keyof Database['public']['Tables'];
