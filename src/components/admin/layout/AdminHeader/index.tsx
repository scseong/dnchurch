'use client';

import clsx from 'clsx';
import { HiOutlineBell, HiOutlineMenu, HiOutlineSearch } from 'react-icons/hi';
import styles from './index.module.scss';

interface AdminHeaderProps {
  crumbs: string[];
  onMobileMenuClick: () => void;
}

export default function AdminHeader({ crumbs, onMobileMenuClick }: AdminHeaderProps) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menu_btn}
        onClick={onMobileMenuClick}
        aria-label="메뉴 열기"
      >
        <HiOutlineMenu />
      </button>

      <nav className={styles.crumbs} aria-label="경로">
        <ol className={styles.crumbs_list}>
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={`${crumb}-${index}`} className={styles.group}>
                {index > 0 && (
                  <span className={styles.separator} aria-hidden>
                    /
                  </span>
                )}
                <span
                  className={clsx(styles.crumb, last && styles.current)}
                  aria-current={last ? 'page' : undefined}
                >
                  {crumb}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={styles.search} role="button" tabIndex={0}>
        <HiOutlineSearch className={styles.search_icon} />
        <span className={styles.search_text}>검색</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </div>

      <button type="button" className={styles.bell} aria-label="알림">
        <HiOutlineBell />
        <span className={styles.dot} aria-hidden />
      </button>
    </header>
  );
}
