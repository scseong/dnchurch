'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LuHouse, LuBook, LuFileText, LuUsers, LuMenu } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { BOTTOM_NAV_ITEMS, isActiveBottomNav, type IconName } from '@/config/navigation';
import Drawer from '@/components/layout/Header/Drawer';
import useDrawerHistory from '@/hooks/useDrawerHistory';
import styles from './BottomNav.module.scss';

const ICON_MAP: Record<IconName, IconType> = {
  home: LuHouse,
  book: LuBook,
  file: LuFileText,
  users: LuUsers,
  menu: LuMenu
};

export default function BottomNav() {
  const pathname = usePathname();
  const { drawerOpen, openDrawer, closeDrawer } = useDrawerHistory();

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
                  <button
                    type="button"
                    className={clsx(styles.tab_item, drawerOpen && styles.active)}
                    aria-label={item.label}
                    aria-expanded={drawerOpen}
                    aria-haspopup="dialog"
                    onClick={openDrawer}
                  >
                    <span className={styles.tab_icon}>
                      <Icon />
                    </span>
                    <span className={styles.tab_label}>{item.label}</span>
                  </button>
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
                    <Icon />
                  </span>
                  <span className={styles.tab_label}>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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
