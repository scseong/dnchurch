'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Carousel.module.scss';

export type UseCarouselReturn = {
  ref: React.RefObject<HTMLDivElement>;
  scroll: (dir: -1 | 1) => void;
  canL: boolean;
  canR: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  stopDrag: () => void;
  clickGuard: (e: React.MouseEvent<HTMLDivElement>) => void;
};

const DRAG_THRESHOLD_PX = 3;
const SCROLL_AMOUNT_RATIO = 0.7;
const SCROLL_EDGE_TOLERANCE_PX = 4;

export function useCarousel(): UseCarouselReturn {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, scrollX: 0, moved: false });
  const [canL, setCanL] = useState(false);
  const [canR, setCanR] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      setCanL(el.scrollLeft > SCROLL_EDGE_TOLERANCE_PX);
      setCanR(el.scrollLeft + el.clientWidth < el.scrollWidth - SCROLL_EDGE_TOLERANCE_PX);
    };

    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * SCROLL_AMOUNT_RATIO), behavior: 'smooth' });
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    drag.current = { active: true, startX: e.pageX, scrollX: el.scrollLeft, moved: false };
    el.style.cursor = 'grabbing';
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drag.current.active) return;
    e.preventDefault();
    const dx = e.pageX - drag.current.startX;
    if (Math.abs(dx) > DRAG_THRESHOLD_PX) drag.current.moved = true;
    if (ref.current) ref.current.scrollLeft = drag.current.scrollX - dx;
  };

  const stopDrag = () => {
    drag.current.active = false;
    if (ref.current) ref.current.style.cursor = 'grab';
  };

  const clickGuard = (e: React.MouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.stopPropagation();
      e.preventDefault();
      drag.current.moved = false;
    }
  };

  return { ref, scroll, canL, canR, onMouseDown, onMouseMove, stopDrag, clickGuard };
}

type CarouselArrowsProps = {
  canL: boolean;
  canR: boolean;
  onScroll: (dir: -1 | 1) => void;
};

export function CarouselArrows({ canL, canR, onScroll }: CarouselArrowsProps) {
  return (
    <div className={styles.arrows}>
      <button
        type="button"
        className={styles.arrow_button}
        onClick={() => onScroll(-1)}
        disabled={!canL}
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
        disabled={!canR}
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
  const { ref, canL, canR, onMouseDown, onMouseMove, stopDrag, clickGuard } = carousel;

  return (
    <div className={styles.viewport}>
      <div
        ref={ref}
        className={clsx(styles.track, mobileFullBleed && styles.full_bleed)}
        role="region"
        aria-label={ariaLabel}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onClickCapture={clickGuard}
      >
        {children}
      </div>
      <div
        className={clsx(styles.fade_left, canL && styles.fade_visible)}
        aria-hidden="true"
      />
      <div
        className={clsx(styles.fade_right, canR && styles.fade_visible)}
        aria-hidden="true"
      />
    </div>
  );
}
