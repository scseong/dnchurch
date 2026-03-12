'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { sitemap } from '@/constants/sitemap';
import { resolveCurrentNode } from '@/utils/sitemap';
import styles from './MobileNavigation.module.scss';

export default function MobileNavigation() {
  const pathname = usePathname();
  const [openPath, setOpenPath] = useState<string | null>(null);

  useEffect(() => {
    const { parent } = resolveCurrentNode(pathname);
    if (parent) {
      setOpenPath(parent.path);
    }
  }, [pathname]);

  const handleToggle = (path: string) => {
    setOpenPath((prev) => (prev === path ? null : path));
  };

  const navItems = sitemap.filter((item) => item.inNav);

  return (
    <div className={styles.nav_container}>
      <div className={styles.nav_header}>
        <div className={styles.nav_logo}>
          환영합니다.
          <br />
          <strong>대구동남교회</strong>입니다.
        </div>
        {/* TODO: 인증 상태에 따라 분기 */}
        <div className={styles.auth_links}>
          <Link href="/login">로그인</Link>
          <span className={styles.nav_divider} />
          <Link href="/sign-up">회원가입</Link>
          {/* <span className={styles.nav_divider} /> */}
          {/* <Link href="/find-account">아이디/패스워드 찾기</Link> */}
        </div>
      </div>

      <nav>
        <ul className={styles.menu_list}>
          {navItems.map((item) => {
            const isOpen = openPath === item.path;
            const hasChildren = !!(item.children && item.children.length > 0);
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
                      {item.children?.map((child) => (
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
