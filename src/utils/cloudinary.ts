import { ImageLoaderProps } from 'next/image';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

export const getCloudinaryUrl = (publicId: string) => `${BASE_URL}/${publicId}`;

export const getCloudinaryDownloadUrl = (publicId: string) =>
  `${BASE_URL}/fl_attachment/${publicId}`;

export type CropMode = 'fill' | 'crop' | 'thumb' | 'scale' | 'fit' | 'limit' | 'pad' | 'auto';
export type CropGravity = 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';

type CloudinaryLoaderOptions = {
  cropMode?: CropMode;
  gravity?: CropGravity;
  aspectRatio?: string;
};

export function createCloudinaryLoader({ cropMode, gravity, aspectRatio }: CloudinaryLoaderOptions = {}) {
  return function ({ src, width, quality }: ImageLoaderProps) {
    const params = ['f_auto'];
    if (cropMode) {
      params.push(`c_${cropMode}`);
      if (gravity) params.push(`g_${gravity}`);
      if (aspectRatio) params.push(`ar_${aspectRatio}`);
    } else {
      params.push('c_limit');
    }
    params.push(`w_${width}`, `q_${quality || 85}`);
    return `${BASE_URL}/${params.join(',')}/${src}`;
  };
}

export default createCloudinaryLoader();
