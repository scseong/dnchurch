import type { CSSProperties } from 'react';

const REVEAL_TRANSLATE_Y = '2.4rem';
const REVEAL_DURATION = '0.8s';

/** 리스트·카드 아이템 순차 딜레이 간격 (QuickAccess, SermonCard 등) */
export const REVEAL_STEP = 0.15;

/** 콘텐츠 요소 순차 딜레이 간격 (Banner scripture → h1 → p → cta 등) */
export const REVEAL_STEP_CONTENT = 0.18;

export const revealStyle = (delay?: number): CSSProperties => ({
  opacity: 0,
  transform: `translateY(${REVEAL_TRANSLATE_Y})`,
  transition: `opacity ${REVEAL_DURATION} ease, transform ${REVEAL_DURATION} ease`,
  ...(delay ? { transitionDelay: `${delay}s` } : {})
});

export const getRevealStyle = (step: number = 0) => revealStyle(REVEAL_STEP_CONTENT * step);
