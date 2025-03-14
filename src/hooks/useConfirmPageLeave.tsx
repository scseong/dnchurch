'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export default function useConfirmPageLeave(targetUrl: string) {
  const router = useRouter();

  const handleBack = useCallback(
    (e?: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
      e?.preventDefault();
      if (window.confirm('작성하던 내용이 모두 사라집니다. 계속하시겠습니까?')) {
        router.push(targetUrl);
      }
    },
    [router, targetUrl]
  );

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      e.preventDefault();
      window.history.pushState(null, '', window.location.pathname);
      handleBack();
    };

    window.history.pushState(null, '', window.location.pathname);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleBack]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();

      return '작성하던 내용이 모두 사라집니다. 계속하시겠습니까?';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return { handleBack };
}
