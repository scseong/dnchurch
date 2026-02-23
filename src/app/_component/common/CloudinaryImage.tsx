'use client';

import Image, { ImageProps } from 'next/image';
import cloudinaryLoader from '@/shared/util/cloudinaryLoader';

export default function CloudinaryImage({
  src,
  alt,
  width,
  height,
  fill,
  sizes,
  style,
  ...rest
}: ImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      fill={fill}
      sizes={sizes}
      loader={cloudinaryLoader}
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
