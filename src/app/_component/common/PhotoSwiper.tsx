'use client';

import { CldImage } from 'next-cloudinary';
import { Gallery, Item } from 'react-photoswipe-gallery';
import { getCloudinaryImgUrl } from '@/shared/util/cdnImage';
import 'photoswipe/dist/photoswipe.css';

type ImageQuality = 'auto' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
type AspectRatio = '1:1' | '4:3' | '16:9' | '21:9' | (string & {});
type PhotoSwiperProps = {
  images: string[];
  thumbnailSize?: {
    width: number;
    height: number;
  };
  fullSize?: {
    width: number;
    height: number;
  };
  aspectRatio?: AspectRatio;
  quality?: ImageQuality;
  sizes?: string;
  prioritizeFirst?: boolean;
  altPrefix?: string;
  className?: string;
};

export default function PhotoSwiper({
  images,
  aspectRatio = '4:3',
  quality = 'auto:best',
  sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 1200px',
  prioritizeFirst = true,
  altPrefix = 'Gallery image',
  className = ''
}: PhotoSwiperProps) {
  const getAspectRatioValue = (ratio: AspectRatio): number => {
    if (typeof ratio === 'number') return ratio;

    const ratioMap: Record<string, number> = {
      '1:1': 1,
      '4:3': 4 / 3,
      '16:9': 16 / 9,
      '21:9': 21 / 9
    };

    return ratioMap[ratio] || 4 / 3;
  };

  const aspectRatioValue = getAspectRatioValue(aspectRatio);
  const thumbnailWidth = 1600;
  const thumbnailHeight = Math.round(thumbnailWidth / aspectRatioValue);
  const fullWidth = 2400;
  const fullHeight = Math.round(fullWidth / aspectRatioValue);

  return (
    <Gallery>
      {images.map((publicId, index) => (
        <Item
          key={publicId || index}
          original={getCloudinaryImgUrl({
            src: publicId,
            width: fullWidth,
            height: fullHeight
          })}
          width={fullWidth}
          height={fullHeight}
        >
          {({ ref, open }) => (
            <div
              ref={ref as any}
              onClick={open}
              className={className}
              style={{
                position: 'relative',
                width: '100%',
                cursor: 'pointer',
                aspectRatio: aspectRatioValue
              }}
            >
              <CldImage
                src={publicId}
                width={thumbnailWidth}
                height={thumbnailHeight}
                alt={`${altPrefix} ${index + 1}`}
                sizes={sizes}
                preload={prioritizeFirst && index === 0}
                crop="fill"
                gravity="auto"
                quality={quality}
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'block'
                }}
              />
            </div>
          )}
        </Item>
      ))}
    </Gallery>
  );
}
