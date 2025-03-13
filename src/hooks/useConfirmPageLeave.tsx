'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function useConfirmPageLeave(targetUrl: string) {
  const router = useRouter();

  const handleBack = useCallback(
    (event?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      event?.preventDefault();
      if (window.confirm('작성하던 내용이 모두 사라집니다. 계속하시겠습니까?')) {
        router.push(targetUrl);
      }
    },
    [router, targetUrl]
  );

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      console.log('뒤로 가기 1');
      event.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
      handleBack();
    };

    console.log('뒤로 가기 2');
    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBack]);

  useEffect(() => {
    console.log('새로 고침침 1');

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      console.log('새로 고침침 2');

      return '작성하던 내용이 모두 사라집니다. 계속하시겠습니까?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return { handleBack };
}
