import type { ImageFormat, ImageCrop, ImageQuality } from '@/shared/types/cloudinary';

type CloudinaryTransform = {
  src: string;
  width: number;
  crop?: ImageCrop;
  format?: ImageFormat;
  quality?: ImageQuality;
};

export function getCloudinaryImgUrl({
  src,
  width,
  crop = 'fill',
  format = 'auto',
  quality = 'auto'
}: CloudinaryTransform) {
  if (!src.includes('/upload/')) return src;
  return src.replace('/upload/', `/upload/w_${width},c_${crop},q_${quality},f_${format}/`);
}
