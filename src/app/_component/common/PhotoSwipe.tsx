'use client';

import { useState } from 'react';
import { Gallery, Item } from 'react-photoswipe-gallery';
import CloudinaryImage from '@/app/_component/common/CloudinaryImage';
import cloudinaryLoader from '@/shared/util/cloudinaryLoader';
import type { PhotoSwipeOptions } from 'photoswipe';
import styles from './PhotoSwipe.module.scss';

type PhotoSwipeProps = {
  imageUrls: string[];
  width: number;
  height: number;
  sizes?: string;
  className?: string;
};

export default function PhotoSwipe({
  imageUrls,
  width: initialWidth,
  height: initialHeight,
  sizes = '100vw',
  className = ''
}: PhotoSwipeProps) {
  const [imgDimensions, setImgDimensions] = useState<{ [key: number]: { w: number; h: number } }>(
    {}
  );
  const [loadedImages, setLoadedImages] = useState<{ [key: number]: boolean }>({});

  const handleImageLoad = (index: number, e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;

    setImgDimensions((prev) => ({
      ...prev,
      [index]: { w: naturalWidth, h: naturalHeight }
    }));

    setLoadedImages((prev) => ({
      ...prev,
      [index]: true
    }));
  };

  const options: PhotoSwipeOptions = {
    clickToCloseNonZoomable: false,
    wheelToZoom: true,
    showHideAnimationType: 'zoom',
    initialZoomLevel: 'fit',
    bgClickAction: 'close',
    tapAction: 'close',
    imageClickAction: 'zoom',
    doubleTapAction: 'zoom',
    hideAnimationDuration: 200
  };

  return (
    <Gallery options={options}>
      <div>
        {imageUrls.map((url, index) => {
          const originalUrl = cloudinaryLoader({ src: url, width: 1920 });
          const currentW = Math.round(imgDimensions[index]?.w || initialWidth);
          const currentH = Math.round(imgDimensions[index]?.h || initialHeight);
          const isLoaded = loadedImages[index];
          const aspectRatio = isLoaded
            ? `${imgDimensions[index]?.w} / ${imgDimensions[index]?.h}`
            : `${initialWidth} / ${initialHeight}`;

          return (
            <Item
              key={url}
              original={originalUrl}
              thumbnail={originalUrl}
              width={currentW}
              height={currentH}
            >
              {({ ref, open }) => (
                <div className={styles.container} onClick={open} style={{ aspectRatio }}>
                  {!isLoaded && <div className={styles.skeleton} />}
                  <div
                    ref={ref}
                    className={`${styles.imageBox} ${className} ${isLoaded ? styles.visible : styles.hidden}`}
                  >
                    <CloudinaryImage
                      src={url}
                      alt={`이미지 ${index + 1}`}
                      width={initialWidth}
                      height={initialHeight}
                      sizes={sizes}
                      onLoad={(e) => handleImageLoad(index, e)}
                      style={{
                        objectFit: 'contain',
                        display: 'block',
                        height: 'auto'
                      }}
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
