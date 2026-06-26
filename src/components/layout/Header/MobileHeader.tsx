'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IoChevronBack } from 'react-icons/io5';
import { LuMenu } from 'react-icons/lu';
import clsx from 'clsx';
import { resolveMobileHeader, resolveSiblingTabs } from '@/config/navigation';
import useDrawerHistory from '@/hooks/useDrawerHistory';
import Drawer from './Drawer';
import styles from './Header.module.scss';

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { title, showBack } = resolveMobileHeader(pathname);
  const tabs = resolveSiblingTabs(pathname);
  const { drawerOpen, openDrawer, closeDrawer } = useDrawerHistory();
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <header className={styles.mobile_header}>
        <div className={styles.mobile_top}>
          <div className={styles.mobile_left}>
            {showBack ? (
              <>
                <button
                  type="button"
                  className={styles.mobile_back}
                  onClick={() => router.back()}
                  aria-label="뒤로 가기"
                >
                  <IoChevronBack />
                </button>
                <h1 className={styles.mobile_title}>{title}</h1>
              </>
            ) : (
              <Link href="/" className={styles.mobile_logo} aria-label="대구동남교회 홈">
                <span className={styles.mobile_logo_icon} aria-hidden="true">
                  <LeafMark />
                </span>
                <span className={styles.mobile_logo_text}>대구동남교회</span>
              </Link>
            )}
          </div>

          <div className={styles.mobile_actions}>
            <button
              type="button"
              className={styles.mobile_menu}
              onClick={openDrawer}
              aria-label="전체 메뉴 열기"
              aria-expanded={drawerOpen}
              aria-haspopup="dialog"
            >
              <LuMenu />
            </button>
          </div>
        </div>

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

      <div
        ref={overlayRef}
        className={clsx(styles.drawer_overlay, drawerOpen && styles.drawer_overlay_open)}
        onClick={(e) => {
          if (e.target === overlayRef.current) closeDrawer();
        }}
        inert={!drawerOpen}
      >
        <Drawer isOpen={drawerOpen} onClose={closeDrawer} />
      </div>
    </>
  );
}

function LeafMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-4 15-9 15Z" />
      <path d="M4 20c4-1 7-4 12-9" />
    </svg>
  );
}
