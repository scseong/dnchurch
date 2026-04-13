'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IoChevronBack, IoSearchOutline, IoNotificationsOutline } from 'react-icons/io5';
import clsx from 'clsx';
import { resolveMobileHeader, resolveSiblingTabs } from '@/config/navigation';
import styles from './Header.module.scss';

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, showBack } = resolveMobileHeader(pathname);
  const tabs = resolveSiblingTabs(pathname);

  return (
    <header className={styles.mobile_header}>
      {/* 상단 행: 타이틀 + 액션 */}
      <div className={styles.mobile_top}>
        <div className={styles.mobile_title_area}>
          {showBack && (
            <button
              type="button"
              className={styles.mobile_back}
              onClick={() => router.back()}
              aria-label="뒤로 가기"
            >
              <IoChevronBack />
            </button>
          )}
          <h1 className={styles.mobile_title}>{title}</h1>
        </div>

        <div className={styles.mobile_actions}>
          <Link href="/search" className={styles.mobile_action_btn} aria-label="검색">
            <IoSearchOutline />
          </Link>
          <button type="button" className={styles.mobile_action_btn} aria-label="알림">
            <IoNotificationsOutline />
          </button>
        </div>
      </div>

      {/* 하단 행: 형제 페이지 탭 */}
      {tabs && (
        <nav className={styles.mobile_tabs} aria-label="하위 페이지 탭">
          <ul className={styles.mobile_tab_list}>
            {tabs.map((tab) => (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  className={clsx(
                    styles.mobile_tab,
                    pathname.startsWith(tab.href) && styles.mobile_tab_active
                  )}
                >
                  {tab.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
