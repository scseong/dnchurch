'use client';

import { Gallery, Item } from 'react-photoswipe-gallery';
import CloudinaryImage from '@/app/_component/common/CloudinaryImage';
import type { ImageQuality } from '@/shared/types/cloudinary';

type PhotoSwipeProps = {
  imageUrls: string[];
  width: number;
  srcsetWidths: number[];
  quality?: ImageQuality;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

export default function PhotoSwipe({
  imageUrls,
  width,
  srcsetWidths,
  quality = 'auto:good',
  sizes = '100vw',
  priority = false,
  className = ''
}: PhotoSwipeProps) {
  return (
    <Gallery>
      {imageUrls.map((url, index) => (
        <Item key={url} original={url}>
          {({ ref, open }) => (
            <div
              ref={ref}
              onClick={open}
              className={className}
              aria-label={`이미지 ${index + 1} 크게 보기`}
              style={{
                width: '100%',
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              <CloudinaryImage
                src={url}
                alt={`이미지 ${index + 1}`}
                width={width}
                sizes={sizes}
                srcsetWidths={srcsetWidths}
                quality={quality}
                priority={priority}
              />
            </div>
          )}
        </Item>
      ))}
    </Gallery>
  );
}
