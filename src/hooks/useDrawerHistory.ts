'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import useScrollLock from '@/hooks/useScrollLock';

interface DrawerHistoryState {
  __drawer?: true;
}

export default function useDrawerHistory() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pushed = useRef(false);
  const backInFlight = useRef(false);

  useScrollLock(drawerOpen);

  const openDrawer = useCallback(() => {
    if (pushed.current || backInFlight.current) return;
    setDrawerOpen(true);
    history.pushState({ __drawer: true } satisfies DrawerHistoryState, '', window.location.href);
    pushed.current = true;
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    if (pushed.current) {
      pushed.current = false;
      backInFlight.current = true;
      history.back();
    }
  }, []);

  // 뒤로가기로 Drawer 닫기
  useEffect(() => {
    const handlePopState = (_e: PopStateEvent) => {
      backInFlight.current = false;
      if (pushed.current) {
        pushed.current = false;
        setDrawerOpen(false);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // pathname 변경 시 UI만 닫기 (history 제어와 분리)
  useEffect(() => {
    pushed.current = false;
    backInFlight.current = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- pathname 변경에 따른 외부 상태 동기화
    setDrawerOpen(false);
  }, [pathname]);

  return { drawerOpen, openDrawer, closeDrawer };
}
