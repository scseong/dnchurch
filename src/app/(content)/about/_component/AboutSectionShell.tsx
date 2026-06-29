'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ABOUT_REDESIGNED_ROUTES } from '@/config/navigation';
import AboutTabNav from './AboutTabNav';
import styles from './AboutSectionShell.module.scss';

// 목업 재설계 About 탭 페이지(5개)에만 섹션 탭 바 + warm 표면을 입힌다.
// 허브(/about)·serving-people 등 탭 세트 밖 경로는 그대로 통과시킨다.
export default function AboutSectionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!ABOUT_REDESIGNED_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className={styles.surface}>
      <AboutTabNav />
      {children}
    </div>
  );
}
