'use client';

import { useEffect } from 'react';
import '@/styles/globals.scss';
import styles from './global-error.module.scss';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

// 루트 layout 단계 에러를 잡는 최후 경계 — layout을 대체하므로 html/body를 직접 렌더한다.
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    console.error('[global]', error);
  }, [error]);

  return (
    <html lang="ko">
      <body>
        <div className={styles.wrapper} role="alert">
          <p className={styles.title}>문제가 발생했습니다</p>
          <p className={styles.description}>
            잠시 후 다시 시도하거나 새로고침해 주세요.
          </p>
          <button type="button" className={styles.retry} onClick={reset}>
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
