import { randomUUID } from 'crypto';

import { deleteImage, uploadImage } from '@/apis/cloudinary';
import { stripRootPrefix, uploadFolder } from '@/utils/cloudinary';
import type { BulletinImageInput } from '@/types/bulletin';

export { checkAdminPermission } from './_auth-helpers';

type UploadResult = Awaited<ReturnType<typeof uploadImage>>;

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

  const settledUploads = await Promise.allSettled(
    files.map((file, i) => {
      const sanitized = file.name.replace(/\.[^/.]+$/, '').replace(/[^\w가-힣\-]/g, '_');
      // orderIndex로 같은 폼 내 순서 보장, UUID로 다른 세션·같은 날 재업로드 충돌 방지
      const filename = `${startOrderIndex + i}-${randomUUID().slice(0, 8)}-${sanitized}`;
      return uploadImage({ file, folder: folderPath, filename });
    })
  );

  const successfulUploads = settledUploads.filter(
    (result): result is PromiseFulfilledResult<UploadResult> => result.status === 'fulfilled'
  );
  const firstFailedUpload = settledUploads.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  );

  // 부분 실패 시 이미 올라간 이미지를 orphan으로 남기지 않고 모두 청소한 뒤 재throw
  if (firstFailedUpload) {
    await Promise.allSettled(successfulUploads.map((result) => deleteImage(result.value.public_id)));
    throw firstFailedUpload.reason;
  }

  return successfulUploads.map((result, i) => ({
    cloudinaryId: stripRootPrefix(result.value.public_id),
    orderIndex: startOrderIndex + i
  }));
}
