'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import styles from './SectionTabNav.module.scss';

type SectionTab = { href: string; label: string };

type Props = {
  tabs: SectionTab[];
  ariaLabel: string;
  // 경로별 active 판별. 기본은 정확 매칭 + 하위 세그먼트. About처럼 특례가 있으면 넘긴다.
  isActive?: (pathname: string, href: string) => boolean;
};

// 교회 소식 형제 탭(헤더)과 교회 소개 섹션 탭이 공유하는 warm 탭 바.
// active 언더라인은 Link 전체 폭이 아니라 라벨 텍스트 폭만 덮도록 span에 border를 둔다.
const defaultIsActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

export default function SectionTabNav({ tabs, ariaLabel, isActive = defaultIsActive }: Props) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label={ariaLabel}>
      <ul className={styles.list}>
        {tabs.map((tab) => {
          const active = isActive(pathname, tab.href);

          return (
            <li key={tab.href} className={styles.item}>
              <Link
                href={tab.href}
                className={clsx(styles.link, active && styles.active)}
                aria-current={active ? 'page' : undefined}
              >
                <span className={styles.label}>{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
