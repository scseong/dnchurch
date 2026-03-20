import type { CSSProperties } from 'react';

const REVEAL_TRANSLATE_Y = '32px';

export const revealStyle = (delay?: number): CSSProperties => ({
  opacity: 0,
  transform: `translateY(${REVEAL_TRANSLATE_Y})`,
  transition: 'opacity 0.7s ease, transform 0.7s ease',
  ...(delay ? { transitionDelay: `${delay}s` } : {}),
});
