'use client';

import { useRouter } from 'next/navigation';
import styles from '../not-found.module.scss';

// 이전 페이지 버튼만 client로 분리한다 — not-found.tsx는 metadata export 때문에 Server Component여야 한다.
// 직접 유입(북마크·외부 링크)으로 404에 오면 뒤로 갈 기록이 없으므로 홈으로 보낸다.
export default function NotFoundBackButton() {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <button type="button" className={styles.link_back} onClick={handleBack}>
      <span className={styles.arrow} aria-hidden="true">
        ←
      </span>
      <span>이전 페이지</span>
    </button>
  );
}
