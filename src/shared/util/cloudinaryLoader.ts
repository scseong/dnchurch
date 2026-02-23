import { ImageLoaderProps } from 'next/image';

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 85}`];
  const paramsString = params.join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${paramsString}/${src}`;
}
