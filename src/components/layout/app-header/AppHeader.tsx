'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IoChevronBack, IoSearchOutline, IoNotificationsOutline } from 'react-icons/io5';
import { resolveHeaderMode } from '@/constants/app-navigation';
import styles from './AppHeader.module.scss';

export default function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const mode = resolveHeaderMode(pathname);

  return (
    <header className={styles.header}>
      <div className={styles.header_inner}>
        {/* 좌측 영역 */}
        <div className={styles.left}>
          {mode.type === 'logo' && (
            <Link href="/" className={styles.logo}>
              <span className={styles.logo_text}>대구동남교회</span>
            </Link>
          )}
          {mode.type === 'back' && (
            <button
              type="button"
              className={styles.back_button}
              onClick={() => router.push(mode.path)}
            >
              <IoChevronBack />
            </button>
          )}
        </div>

        {/* 중앙 타이틀 */}
        {(mode.type === 'title' || mode.type === 'back') && (
          <h1 className={styles.title}>{mode.label}</h1>
        )}

        {/* 우측 액션 */}
        <div className={styles.right}>
          {/* <Link href="/notifications" className={styles.action_button} aria-label="알림">
            <IoNotificationsOutline />
          </Link> */}
          <Link href="#" className={styles.action_button} aria-label="검색">
            <IoSearchOutline />
          </Link>
        </div>
      </div>
    </header>
  );
}
