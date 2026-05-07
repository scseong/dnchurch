'use client';

import { useEffect } from 'react';

// 다중 dialog 환경에서 stack-safe — 중첩 lock 카운트로 마지막 unlock 시에만 body 복원.
// (예: Modal 안에서 BottomSheet가 열렸다 닫혀도 외부 Modal의 scroll lock 유지)
let lockCount = 0;
let savedScrollY = 0;

function applyLock() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const body = document.body;
  if (lockCount === 0) {
    savedScrollY = window.scrollY;
    body.style.position = 'fixed';
    body.style.top = `-${savedScrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflowY = 'scroll';
    body.style.width = '100%';
  }
  lockCount += 1;
}

function releaseLock() {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    const body = document.body;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.overflowY = '';
    body.style.width = '';
    window.scrollTo(0, savedScrollY);
  }
}

export default function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;
    applyLock();
    return releaseLock;
  }, [isLocked]);
}
