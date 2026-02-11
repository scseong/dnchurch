'use client';

import { getCloudinaryImgUrl } from '@/shared/util/cdnImage';
import type { CloudinaryImageProps } from '@/shared/types/cloudinary';

export default function CloudinaryImage({
  src,
  alt,
  width,
  sizes,
  srcsetWidths,
  quality = 'auto:good',
  crop = 'fit',
  priority = false,
  className,
  style
}: CloudinaryImageProps) {
  const srcFallback = getCloudinaryImgUrl({
    src,
    width,
    quality,
    crop
  });

  const srcSet = srcsetWidths
    .map((width) => {
      const url = getCloudinaryImgUrl({
        src,
        width,
        quality,
        crop
      });
      return `${url} ${width}w`;
    })
    .join(', ');

  return (
    <img
      src={srcFallback}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      decoding={priority ? 'sync' : 'async'}
      className={className}
      style={{ width: '100%', height: 'auto', display: 'block', ...style }}
    />
  );
}
