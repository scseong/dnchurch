'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { useState } from 'react';
import { sitemap } from '@/constants/sitemap';
import useScrollLock from '@/hooks/useScrollLock';
import styles from './MobileDrawer.module.scss';

type Props = {
  pathname: string;
  onClose: () => void;
};

export default function MobileDrawer({ pathname, onClose }: Props) {
  const navItems = sitemap.filter((item) => item.inNav);

  const [expandedIndex, setExpandedIndex] = useState<number | null>(() => {
    const idx = navItems.findIndex((item) => pathname.startsWith(item.path));
    return idx >= 0 ? idx : null;
  });

  useScrollLock(true);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="모바일 메뉴">
        <div className={styles.header}>
          <button className={styles.close_btn} onClick={onClose} aria-label="메뉴 닫기">
            ✕
          </button>
        </div>

        <nav>
          <ul className={styles.menu_list}>
            {navItems.map((item, i) => {
              const isExpanded = expandedIndex === i;
              const isActive = pathname.startsWith(item.path);
              const hasChildren = !!(item.children?.length);

              return (
                <li key={item.path} className={styles.menu_item}>
                  {hasChildren ? (
                    <button
                      className={clsx(styles.depth1, isActive && styles.depth1_active)}
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      aria-expanded={isExpanded}
                    >
                      {item.label}
                      <span
                        className={clsx(styles.chevron, isExpanded && styles.chevron_open)}
                        aria-hidden="true"
                      />
                    </button>
                  ) : (
                    <Link
                      href={item.path}
                      className={clsx(styles.depth1, isActive && styles.depth1_active)}
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  )}

                  {hasChildren && (
                    <div className={clsx(styles.sub_wrapper, isExpanded && styles.sub_expanded)}>
                      <ul className={styles.sub_list}>
                        {item.children?.map((child) => (
                          <li key={child.path}>
                            <Link
                              href={child.path}
                              className={clsx(
                                styles.depth2,
                                pathname.startsWith(child.path) && styles.depth2_active
                              )}
                              onClick={onClose}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}
