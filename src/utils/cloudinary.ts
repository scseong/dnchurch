import { ImageLoaderProps } from 'next/image';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export const getCloudinaryUrl = (publicId: string) => `${BASE_URL}/${publicId}`;

export const getCloudinaryDownloadUrl = (publicId: string) =>
  `${BASE_URL}/fl_attachment/${publicId}`;

export default function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const params = ['f_auto', 'c_limit', `w_${width}`, `q_${quality || 85}`];
  return `${BASE_URL}/${params.join(',')}/${src}`;
}
