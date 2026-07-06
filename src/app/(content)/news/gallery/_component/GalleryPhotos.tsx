'use client';

import { useEffect, useRef } from 'react';
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

function fetchSrc(photo: GalleryPhoto): string {
  return cloudinaryFetchUrl(photo.remoteUrl) ?? photo.remoteUrl;
}

function CountBadge({ count }: { count: number }) {
  if (count <= 1) return null;
  return (
    <span className={styles.count_badge}>
      <LuImages aria-hidden="true" />
      {count}
    </span>
  );
}

type Props = {
  photos: GalleryPhoto[];
  /** 제공하면 사진 전체가 상세 열기 버튼이 된다(피드). 없으면 각 사진을 라이트박스로 연다(상세 모달). */
  onOpen?: () => void;
};

export default function GalleryPhotos({ photos, onOpen }: Props) {
  const pswpRef = useRef<PhotoSwipeType | null>(null);
  const lightboxOpenRef = useRef(false);

  // 라이트박스가 열려 있는 동안 Escape는 라이트박스만 닫는다. 부모 시트(useDialog)의
  // Escape 닫힘 리스너가 함께 실행돼 시트까지 닫히는 걸, 캡처 단계에서 가로채 막는다.
  useEffect(() => {
    const handleEscapeCapture = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && lightboxOpenRef.current) {
        e.stopPropagation();
        pswpRef.current?.close();
      }
    };
    document.addEventListener('keydown', handleEscapeCapture, true);
    return () => document.removeEventListener('keydown', handleEscapeCapture, true);
  }, []);

  // 피드: 사진 그리드 전체가 상세 모달을 여는 버튼. 개별 라이트박스는 상세 안에서.
  if (onOpen) {
    return (
      <button
        type="button"
        className={clsx(styles.media, styles.media_open, layoutClass(photos.length))}
        onClick={onOpen}
        aria-label="게시글 상세 보기"
      >
        {photos.map((photo, index) => (
          <span key={photo.remoteUrl + index} className={styles.media_tile_static}>
            <CloudinaryImage src={fetchSrc(photo)} alt="" fill sizes="(max-width: 640px) 50vw, 320px" />
          </span>
        ))}
        <CountBadge count={photos.length} />
      </button>
    );
  }

  // 상세 모달: 각 사진을 PhotoSwipe 라이트박스로.
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

  const handleBeforeOpen = (pswp: PhotoSwipeType) => {
    pswpRef.current = pswp;
    lightboxOpenRef.current = true;
    pswp.on('destroy', () => {
      lightboxOpenRef.current = false;
    });
  };

  return (
    <Gallery options={options} onBeforeOpen={handleBeforeOpen}>
      <div className={clsx(styles.media, layoutClass(photos.length))}>
        {photos.map((photo, index) => {
          const src = fetchSrc(photo);
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
        <CountBadge count={photos.length} />
      </div>
    </Gallery>
  );
}
