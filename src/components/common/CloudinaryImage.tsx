'use client';

import Image, { ImageProps } from 'next/image';
import { createCloudinaryLoader, CropMode, CropGravity } from '@/utils/cloudinary';

type Props = ImageProps & {
  cropMode?: CropMode;
  gravity?: CropGravity;
  aspectRatio?: string;
};

export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  style,
  cropMode,
  gravity,
  aspectRatio,
  ...rest
}: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      loader={createCloudinaryLoader({ cropMode, gravity, aspectRatio })}
      style={{
        width: fill ? undefined : '100%',
        height: fill ? undefined : style?.height || 'auto',
        display: 'block',
        ...style
      }}
      {...rest}
    />
  );
}
