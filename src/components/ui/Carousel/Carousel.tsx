'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Carousel.module.scss';

type ScrollDirection = -1 | 1;

export type UseCarouselReturn = {
  trackRef: React.RefObject<HTMLDivElement>;
  scrollByDirection: (direction: ScrollDirection) => void;
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onMouseDown: (event: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (event: React.MouseEvent<HTMLDivElement>) => void;
  stopDrag: () => void;
  clickGuard: (event: React.MouseEvent<HTMLDivElement>) => void;
};

const DRAG_THRESHOLD_PX = 3;
const SCROLL_AMOUNT_RATIO = 0.7;
const SCROLL_EDGE_TOLERANCE_PX = 4;

export function useCarousel(): UseCarouselReturn {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
    moved: false
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateScrollBounds = () => {
      setCanScrollLeft(track.scrollLeft > SCROLL_EDGE_TOLERANCE_PX);
      setCanScrollRight(
        track.scrollLeft + track.clientWidth <
          track.scrollWidth - SCROLL_EDGE_TOLERANCE_PX
      );
    };

    updateScrollBounds();
    track.addEventListener('scroll', updateScrollBounds, { passive: true });
    window.addEventListener('resize', updateScrollBounds);
    return () => {
      track.removeEventListener('scroll', updateScrollBounds);
      window.removeEventListener('resize', updateScrollBounds);
    };
  }, []);

  const scrollByDirection = (direction: ScrollDirection) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * Math.round(track.clientWidth * SCROLL_AMOUNT_RATIO),
      behavior: 'smooth'
    });
  };

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;
    dragState.current = {
      active: true,
      startX: event.pageX,
      startScrollLeft: track.scrollLeft,
      moved: false
    };
    track.style.cursor = 'grabbing';
  };

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragState.current.active) return;
    event.preventDefault();
    const dragDeltaX = event.pageX - dragState.current.startX;
    if (Math.abs(dragDeltaX) > DRAG_THRESHOLD_PX) {
      dragState.current.moved = true;
    }
    if (trackRef.current) {
      trackRef.current.scrollLeft =
        dragState.current.startScrollLeft - dragDeltaX;
    }
  };

  const stopDrag = () => {
    dragState.current.active = false;
    if (trackRef.current) trackRef.current.style.cursor = 'grab';
  };

  const clickGuard = (event: React.MouseEvent<HTMLDivElement>) => {
    if (dragState.current.moved) {
      event.stopPropagation();
      event.preventDefault();
      dragState.current.moved = false;
    }
  };

  return {
    trackRef,
    scrollByDirection,
    canScrollLeft,
    canScrollRight,
    onMouseDown,
    onMouseMove,
    stopDrag,
    clickGuard
  };
}

type CarouselArrowsProps = {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScroll: (direction: ScrollDirection) => void;
};

export function CarouselArrows({
  canScrollLeft,
  canScrollRight,
  onScroll
}: CarouselArrowsProps) {
  return (
    <div className={styles.arrows}>
      <button
        type="button"
        className={styles.arrow_button}
        onClick={() => onScroll(-1)}
        disabled={!canScrollLeft}
        aria-label="이전 항목으로 스크롤"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
      <button
        type="button"
        className={styles.arrow_button}
        onClick={() => onScroll(1)}
        disabled={!canScrollRight}
        aria-label="다음 항목으로 스크롤"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

type CarouselProps = {
  children: ReactNode;
  ariaLabel: string;
  mobileFullBleed?: boolean;
  carousel: UseCarouselReturn;
};

export function Carousel({ children, ariaLabel, mobileFullBleed = false, carousel }: CarouselProps) {
  const {
    trackRef,
    scrollByDirection,
    canScrollLeft,
    canScrollRight,
    onMouseDown,
    onMouseMove,
    stopDrag,
    clickGuard
  } = carousel;

  // 트랙 자신에 focus가 있을 때만 ←/→ 스크롤 — 자식 Link 등 focus 중 버블링 hijack 방지(DL-3)
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.currentTarget !== event.target) return;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollByDirection(-1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollByDirection(1);
    }
  };

  return (
    <div className={styles.viewport}>
      <div
        ref={trackRef}
        className={clsx(styles.track, mobileFullBleed && styles.full_bleed)}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onClickCapture={clickGuard}
      >
        {children}
      </div>
      <div
        className={clsx(styles.fade_left, canScrollLeft && styles.fade_visible)}
        aria-hidden="true"
      />
      <div
        className={clsx(styles.fade_right, canScrollRight && styles.fade_visible)}
        aria-hidden="true"
      />
    </div>
  );
}
