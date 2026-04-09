'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveBreadcrumbSegments } from '@/config/navigation';
import styles from './Hero.module.scss';

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = resolveBreadcrumbSegments(pathname);

  if (segments.length === 0) return null;

  return (
    <nav className={styles.breadcrumb} aria-label="브레드크럼">
      <ol className={styles.breadcrumb_list}>
        <li className={styles.breadcrumb_item}>
          <Link href="/" className={styles.breadcrumb_link}>
            홈
          </Link>
        </li>
        {segments.map((seg, i) => {
          const isLast = i === segments.length - 1;
          return (
            <li key={`${i}-${seg.href}`} className={styles.breadcrumb_item}>
              <ChevronIcon />
              {isLast ? (
                <span className={styles.breadcrumb_current} aria-current="page">
                  {seg.label}
                </span>
              ) : (
                <Link href={seg.href} className={styles.breadcrumb_link}>
                  {seg.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
