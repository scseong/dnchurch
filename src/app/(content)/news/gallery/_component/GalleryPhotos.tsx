'use client';

import { useRef } from 'react';
import { Gallery, Item } from 'react-photoswipe-gallery';
import clsx from 'clsx';
import { LuImages } from 'react-icons/lu';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import cloudinaryLoader, { cloudinaryFetchUrl } from '@/utils/cloudinary';
import { BASE_PHOTOSWIPE_OPTIONS, isBackgroundTarget } from '@/utils/photoswipe';
import PhotoSwipeType, { type PhotoSwipeOptions } from 'photoswipe';
import type { GalleryPhoto } from '../_types';
import styles from './gallery.module.scss';
// 라이트박스 CSS — 이 컴포넌트가 실리는 라우트에만 로드(전역 오염 방지).
import 'photoswipe/dist/photoswipe.css';

// 사진 수별 그리드 배치. mock은 최대 4장 — 5장 이상은 3열로 모두 노출(실데이터 단계에서 +N 접기 검토).
function layoutClass(count: number): string {
  if (count === 1) return styles.media_single;
  if (count === 2) return styles.media_two;
  if (count === 3) return styles.media_three;
  if (count === 4) return styles.media_four;
  return styles.media_many;
}

export default function GalleryPhotos({ photos }: { photos: GalleryPhoto[] }) {
  const pswpRef = useRef<PhotoSwipeType | null>(null);

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
    <Gallery options={options} onBeforeOpen={(pswp) => (pswpRef.current = pswp)}>
      <div className={clsx(styles.media, layoutClass(photos.length))}>
        {photos.map((photo, index) => {
          const src = cloudinaryFetchUrl(photo.remoteUrl) ?? photo.remoteUrl;
          const original = cloudinaryLoader({ src, width: 1600 });

          return (
            <Item
              key={photo.remoteUrl + index}
              original={original}
              thumbnail={original}
              width={photo.width}
              height={photo.height}
            >
              {({ ref, open }) => (
                <button
                  type="button"
                  ref={ref as React.Ref<HTMLButtonElement>}
                  className={styles.media_tile}
                  onClick={open}
                  aria-label={`${index + 1}번째 사진 크게 보기`}
                >
                  <CloudinaryImage
                    src={src}
                    alt={`갤러리 사진 ${index + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, 320px"
                  />
                </button>
              )}
            </Item>
          );
        })}

        {photos.length > 1 && (
          <span className={styles.count_badge}>
            <LuImages aria-hidden="true" />
            {photos.length}
          </span>
        )}
      </div>
    </Gallery>
  );
}
