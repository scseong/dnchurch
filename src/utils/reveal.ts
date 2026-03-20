import type { CSSProperties } from 'react';

export const revealStyle = (delay?: number): CSSProperties => ({
  opacity: 0,
  transform: 'translateY(32px)',
  transition: 'opacity 0.7s ease, transform 0.7s ease',
  ...(delay ? { transitionDelay: `${delay}s` } : {}),
});
