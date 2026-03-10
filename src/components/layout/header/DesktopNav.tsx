'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { sitemap } from '@/constants/sitemap';
import styles from './DesktopNav.module.scss';

type Props = {
  activeIndex: number | null;
  onItemEnter: (index: number) => void;
  onNavLeave: () => void;
  onLnbEnter: () => void;
  onLnbLeave: () => void;
};

export default function DesktopNav({
  activeIndex,
  onItemEnter,
  onNavLeave,
  onLnbEnter,
  onLnbLeave
}: Props) {
  const navItems = sitemap.filter((item) => item.inNav);

  return (
    <nav className={styles.desktop_nav} onMouseLeave={onNavLeave}>
      <ul className={styles.list}>
        {navItems.map((item, i) => (
          <li
            key={item.path}
            className={clsx(styles.item, activeIndex !== null && styles.item_open)}
          >
            <Link
              href={item.path}
              className={clsx(styles.link, activeIndex === i && styles.link_active)}
              onMouseEnter={() => onItemEnter(i)}
            >
              {item.label}
            </Link>

            {item.children?.length ? (
              <ul className={styles.depth2} onMouseEnter={onLnbEnter} onMouseLeave={onLnbLeave}>
                {item.children.map((child) => (
                  <li key={child.path}>
                    <Link href={child.path} className={styles.depth2_link}>
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
