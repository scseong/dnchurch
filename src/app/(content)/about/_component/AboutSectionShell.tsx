'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { ABOUT_REDESIGNED_ROUTES } from '@/config/navigation';
import SectionTabNav from '@/components/layout/SectionTabNav/SectionTabNav';
import styles from './AboutSectionShell.module.scss';

// 교회 소개 섹션 탭(인사말·예배·오시는 길·비전·환영) — 목업 순서.
const ABOUT_TABS = [
  { href: '/about/pastor', label: '인사말' },
  { href: '/about/worship', label: '예배 안내' },
  { href: '/about/location', label: '오시는 길' },
  { href: '/about/vision', label: '교회의 비전' },
  { href: '/about/welcome', label: '환영합니다' }
];

// /about은 인사말을 직접 렌더하므로 '인사말' 탭(/about/pastor)을 활성으로 본다.
const isAboutTabActive = (pathname: string, href: string) =>
  pathname === href ||
  pathname.startsWith(`${href}/`) ||
  (href === '/about/pastor' && pathname === '/about');

// 목업 재설계 About 탭 페이지(5개)에만 섹션 탭 바 + warm 표면을 입힌다.
// 허브(/about)·serving-people 등 탭 세트 밖 경로는 그대로 통과시킨다.
export default function AboutSectionShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (!ABOUT_REDESIGNED_ROUTES.has(pathname)) {
    return <>{children}</>;
  }

  return (
    <div className={styles.surface}>
      <SectionTabNav tabs={ABOUT_TABS} ariaLabel="교회 소개 섹션" isActive={isAboutTabActive} />
      {children}
    </div>
  );
}
