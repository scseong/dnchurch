'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  BOTTOM_NAV_ITEMS,
  isActiveBottomNav,
  type IconName
} from '@/config/navigation';
import Drawer from '@/components/layout/Header/Drawer';
import styles from './BottomNav.module.scss';

type IconProps = { active: boolean };

function HomeIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BookIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function FileIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function UsersIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MenuIcon({ active }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.4 : 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

const ICON_MAP: Record<IconName, (props: IconProps) => React.ReactNode> = {
  home: HomeIcon,
  book: BookIcon,
  file: FileIcon,
  users: UsersIcon,
  menu: MenuIcon
};

export default function BottomNav() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  // pathname 변경 시 Drawer 닫기
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      <nav className={styles.tab_bar} aria-label="하단 내비게이션">
        <ul className={styles.tab_list}>
          {BOTTOM_NAV_ITEMS.map((item) => {
            const active = isActiveBottomNav(pathname, item.href);
            const Icon = ICON_MAP[item.icon];
            const isMenu = item.icon === 'menu';

            if (isMenu) {
              return (
                <li key={item.href}>
                  <div className={styles.tab_item}>
                    <button type="button" aria-label={item.label} onClick={openDrawer}>
                      <span className={styles.tab_icon}>
                        <Icon active={false} />
                      </span>
                      <span className={styles.tab_label}>{item.label}</span>
                    </button>
                  </div>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(styles.tab_item, active && styles.active)}
                  aria-label={item.label}
                >
                  <span className={styles.tab_icon}>
                    <Icon active={active} />
                  </span>
                  <span className={styles.tab_label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Drawer overlay */}
      <div
        className={clsx(styles.drawer_overlay, drawerOpen && styles.drawer_overlay_open)}
        onClick={closeDrawer}
        aria-hidden={!drawerOpen}
      >
        <Drawer isOpen={drawerOpen} onClose={closeDrawer} />
      </div>
    </>
  );
}
