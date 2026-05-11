import { uploadImage } from '@/apis/cloudinary';
import { stripRootPrefix, uploadFolder } from '@/utils/cloudinary';
import type { BulletinImageInput } from '@/types/bulletin';

export { checkAdminPermission } from './_auth-helpers';

export async function uploadBulletinImages(
  files: File[],
  date: string,
  startOrderIndex = 0
): Promise<BulletinImageInput[]> {
  const targetDate = new Date(date);
  const year = String(targetDate.getFullYear());
  const month = String(targetDate.getMonth() + 1).padStart(2, '0');
  const day = String(targetDate.getDate()).padStart(2, '0');
  const folderPath = uploadFolder('bulletins', year, month, day);

  const results = await Promise.all(
    files.map((file) => {
      const filename = file.name.replace(/\.[^/.]+$/, '').replace(/[^\w가-힣\-]/g, '_');
      return uploadImage({ file, folder: folderPath, filename });
    })
  );

  return results.map((res, i) => ({
    cloudinaryId: stripRootPrefix(res.public_id),
    orderIndex: startOrderIndex + i
  }));
}
