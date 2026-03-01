'use client';

import { useRef, useState } from 'react';
import { Gallery, Item } from 'react-photoswipe-gallery';
import clsx from 'clsx';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import cloudinaryLoader from '@/utils/cloudinary';
import {
  BASE_PHOTOSWIPE_OPTIONS,
  getAspectRatio,
  getSlideSize,
  isBackgroundTarget
} from '@/utils/photoswipe';
import PhotoSwipeType, { type PhotoSwipeOptions } from 'photoswipe';
import { type ImageState, type PhotoSwipeProps } from '@/types/photoswipe';
import styles from './PhotoSwipe.module.scss';

export default function PhotoSwipe({
  images,
  width: initialWidth,
  height: initialHeight,
  sizes = '100vw',
  className = ''
}: PhotoSwipeProps) {
  const pswpRef = useRef<PhotoSwipeType | null>(null);
  const fallbackSize = { w: initialWidth, h: initialHeight };
  const [imageStates, setImageStates] = useState<Record<number, ImageState>>({});

  const handleBeforeOpen = (pswp: PhotoSwipeType) => {
    pswpRef.current = pswp;
  };

  const handleImageLoad = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: w, naturalHeight: h } = e.currentTarget;
    setImageStates((prev) => ({ ...prev, [index]: { w, h, loaded: true } }));
  };

  const options: PhotoSwipeOptions = {
    ...BASE_PHOTOSWIPE_OPTIONS,
    tapAction: (_, originalEvent) => {
      const target = originalEvent?.target;

      if (target instanceof HTMLElement && isBackgroundTarget(target)) {
        pswpRef.current?.close();
      } else {
        pswpRef.current?.element?.classList.toggle('pswp--ui-visible');
      }
    }
  };

  return (
    <Gallery options={options} onBeforeOpen={handleBeforeOpen}>
      <div>
        {images.map((publicId, index) => {
          const state = imageStates[index];
          const originalUrl = cloudinaryLoader({ src: publicId, width: 1920 });
          const slideSize = getSlideSize(state, fallbackSize);
          const aspectRatio = getAspectRatio(state, fallbackSize);

          return (
            <Item
              key={publicId}
              original={originalUrl}
              thumbnail={originalUrl}
              width={slideSize.width}
              height={slideSize.height}
            >
              {({ ref, open }) => (
                <div className={styles.container} style={{ aspectRatio }} onClick={open}>
                  {!state?.loaded && <div className={styles.skeleton} />}

                  <div
                    ref={ref}
                    className={clsx(
                      styles.imageBox,
                      className,
                      state?.loaded ? styles.visible : styles.hidden
                    )}
                  >
                    <CloudinaryImage
                      src={publicId}
                      alt={`이미지 ${index + 1}`}
                      width={initialWidth}
                      height={initialHeight}
                      sizes={sizes}
                      style={{ objectFit: 'contain', display: 'block', height: 'auto' }}
                      onLoad={(e) => handleImageLoad(index, e)}
                    />
                  </div>
                </div>
              )}
            </Item>
          );
        })}
      </div>
    </Gallery>
  );
}
