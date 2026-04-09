'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import clsx from 'clsx';
import { GNB_ITEMS, isActiveGnb } from './navigation.config';
import styles from './MobileNavigation.module.scss';

/** pathname이 속하는 최상위 섹션 href를 반환 */
const findParentHref = (pathname: string) => {
  const item = GNB_ITEMS.find((n) => isActiveGnb(pathname, n));
  return item?.href ?? null;
};

export default function MobileNavigation() {
  const pathname = usePathname();
  const [openHref, setOpenHref] = useState<string | null>(null);

  useEffect(() => {
    setOpenHref(findParentHref(pathname));
  }, [pathname]);

  const handleToggle = (href: string) => {
    setOpenHref((prev) => (prev === href ? null : href));
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
          {GNB_ITEMS.map((item) => {
            const isOpen = openHref === item.href;
            const hasChildren = !!item.children?.length;
            const isActive = isActiveGnb(pathname, item);

            return (
              <li key={item.href} className={styles.menu_item}>
                {hasChildren ? (
                  <button
                    className={clsx(styles.menu_header, isActive && styles.active)}
                    onClick={() => handleToggle(item.href)}
                  >
                    {item.label}
                    <span className={clsx(styles.nav_icon, isOpen && styles.nav_icon_open)} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={clsx(styles.menu_header, isActive && styles.active)}
                  >
                    {item.label}
                  </Link>
                )}

                {hasChildren && (
                  <div className={clsx(styles.sub_menu_wrapper, isOpen && styles.expanded)}>
                    <ul className={styles.sub_menu}>
                      {item.children!.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className={clsx(
                              styles.sub_link,
                              pathname === child.href && styles.active
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
