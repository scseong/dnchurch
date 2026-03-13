import { getUserSession } from '@/apis/auth-server';
import { uploadImage } from '@/apis/cloudinary';
import { createServerSideClient } from '@/lib/supabase/server';
import type { BulletinImageInput } from '@/types/bulletin';

export async function checkAdminPermission() {
  const user = await getUserSession();
  if (!user) return { user: null, isAdmin: false };

  const supabase = await createServerSideClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return { user, isAdmin: profile?.role === 'admin' };
}

export async function uploadBulletinImages(
  files: File[],
  date: string,
  startOrderIndex = 0
): Promise<BulletinImageInput[]> {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const folderPath = `bulletins/${year}/${month}`;

  const results = await Promise.all(
    files.map((file) => {
      const filename = file.name.replace(/\.[^/.]+$/, '').replace(/[^\w가-힣\-]/g, '_');
      return uploadImage({ file, folder: folderPath, filename });
    })
  );

  return results.map((res, i) => ({
    cloudinaryId: res.public_id,
    url: res.secure_url,
    orderIndex: startOrderIndex + i
  }));
}
