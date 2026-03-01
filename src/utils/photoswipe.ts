import { type PhotoSwipeOptions } from 'photoswipe';
import { type FallbackSize, type ImageState } from '@/types/photoswipe';

export const BACKGROUND_CLASS_NAMES = new Set(['pswp__item', 'pswp__zoom-wrap', 'pswp__container']);

export const BASE_PHOTOSWIPE_OPTIONS: PhotoSwipeOptions = {
  loop: false,
  wheelToZoom: true,
  initialZoomLevel: 'fit',
  secondaryZoomLevel: 2.5,
  maxZoomLevel: 6,
  spacing: 0.01,
  hideAnimationDuration: 100,
  errorMsg: '이미지를 불러올 수 없습니다.'
};

export function isBackgroundTarget(target: HTMLElement): boolean {
  for (const cls of target.classList) {
    if (BACKGROUND_CLASS_NAMES.has(cls)) {
      return true;
    }
  }
  return false;
}

export function getAspectRatio(state: ImageState | undefined, fallback: FallbackSize): string {
  return state?.loaded ? `${state.w} / ${state.h}` : `${fallback.w} / ${fallback.h}`;
}

export function getSlideSize(
  state: ImageState | undefined,
  fallback: FallbackSize
): { width: number; height: number } {
  return {
    width: Math.round(state?.w ?? fallback.w),
    height: Math.round(state?.h ?? fallback.h)
  };
}
