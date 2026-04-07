'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { sitemap } from '@/constants/sitemap';
import styles from './MobileNavigation.module.scss';

const EXCLUDED_PATHS = new Set(['/', '/mypage', '/notifications', '/search']);

/** 네비게이션에 표시할 메뉴 항목 */
const navItems = sitemap.filter((item) => !item.detail && !EXCLUDED_PATHS.has(item.path));

/** pathname이 속하는 최상위 섹션 path를 반환 */
const findParentPath = (pathname: string) => {
  const item = navItems.find((n) => pathname.startsWith(n.path));
  return item?.path ?? null;
};

export default function MobileNavigation() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);

  useEffect(() => {
    setOpenPath(findParentPath(pathname));
  }, [pathname]);

  const handleToggle = (path: string) => {
    setOpenPath((prev) => (prev === path ? null : path));
  };

  return (
    <div className={styles.nav_container}>
      <div className={styles.nav_header}>
        <div className={styles.nav_logo}>
          환영합니다.
          <br />
          <strong>대구동남교회</strong>입니다.
        </div>
        <div className={styles.auth_links}>
          <Link href="/login">로그인</Link>
          <span className={styles.nav_divider} />
          <Link href="/sign-up">회원가입</Link>
        </div>
      </div>

      <nav>
        <ul className={styles.menu_list}>
          {navItems.map((item) => {
            const isOpen = openPath === item.path;
            const staticChildren = item.children?.filter((c) => !c.detail) ?? [];
            const hasChildren = staticChildren.length > 0;
            const isActive = pathname.startsWith(item.path);

            return (
              <li key={item.path} className={styles.menu_item}>
                {hasChildren ? (
                  <button
                    className={clsx(styles.menu_header, isActive && styles.active)}
                    onClick={() => handleToggle(item.path)}
                  >
                    {item.label}
                    <span className={clsx(styles.nav_icon, isOpen && styles.nav_icon_open)} />
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    className={clsx(styles.menu_header, isActive && styles.active)}
                  >
                    {item.label}
                  </Link>
                )}

                {hasChildren && (
                  <div className={clsx(styles.sub_menu_wrapper, isOpen && styles.expanded)}>
                    <ul className={styles.sub_menu}>
                      {staticChildren.map((child) => (
                        <li key={child.path}>
                          <Link
                            href={child.path}
                            className={clsx(
                              styles.sub_link,
                              pathname === child.path && styles.active
                            )}
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
  );
}
