'use client';

import { useEffect } from 'react';

export default function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const body = document.body;

    if (isLocked) {
      const scrollY = window.scrollY;

      body.style.position = 'fixed';
      body.style.top = `-${scrollY}px`;
      body.style.left = '0';
      body.style.right = '0';
      body.style.overflowY = 'scroll';
      body.style.width = '100%';

      return () => {
        const top = body.style.top;

        body.style.position = '';
        body.style.top = '';
        body.style.left = '';
        body.style.right = '';
        body.style.overflowY = '';
        body.style.width = '';

        const prevScrollY = parseInt(top || '0', 10) * -1;
        window.scrollTo(0, prevScrollY);
      };
    }
  }, [isLocked]);
}
