'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LuHouse, LuChurch, LuUsers, LuBook, LuUser } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import { BOTTOM_NAV_ITEMS, isActiveBottomNav, type IconName } from '@/config/navigation';
import styles from './BottomNav.module.scss';

const ICON_MAP: Record<IconName, IconType> = {
  home: LuHouse,
  about: LuChurch,
  nextgen: LuUsers,
  sermon: LuBook,
  mypage: LuUser
};

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className={styles.tab_bar} aria-label="하단 내비게이션">
      <ul className={styles.tab_list}>
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActiveBottomNav(pathname, item.href);
          const Icon = ICON_MAP[item.icon];

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
  );
}
