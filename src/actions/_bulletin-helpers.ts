import { uploadImage } from '@/apis/cloudinary';
import type { BulletinImageInput } from '@/types/bulletin';

export { checkAdminPermission } from './_auth-helpers';

export async function uploadBulletinImages(
  files: File[],
  date: string,
  startOrderIndex = 0
): Promise<BulletinImageInput[]> {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rootFolder = process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER;
  const folderPath = `${rootFolder}/bulletins/${year}/${month}/${day}`;

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
