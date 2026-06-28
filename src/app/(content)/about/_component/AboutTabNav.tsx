'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import styles from './AboutTabNav.module.scss';

// 목업 교회 소개 탭(인사말·예배·오시는 길·비전·환영)을 라우트 이동 링크로.
// 활성 탭은 현재 경로(usePathname)로 판정한다.
const TABS = [
  { href: '/about/pastor', label: '인사말' },
  { href: '/about/worship', label: '예배 안내' },
  { href: '/about/location', label: '오시는 길' },
  { href: '/about/vision', label: '교회의 비전' },
  { href: '/about/welcome', label: '환영합니다' }
];

export default function AboutTabNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="교회 소개 섹션">
      <ul className={styles.list}>
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);

          return (
            <li key={tab.href} className={styles.item}>
              <Link
                href={tab.href}
                className={clsx(styles.link, active && styles.active)}
                aria-current={active ? 'page' : undefined}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
