'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sitemap } from '@/constants/sitemap';
import styles from './DesktopNav.module.scss';

export default function DesktopNav() {
  const navItems = sitemap.filter((item) => item.inNav);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);
  const isHoveredRef = useRef(false);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    el.classList.add(styles.no_hover);
    el.closest('header')?.removeAttribute('data-nav-hover');

    if (!isHoveredRef.current) {
      rafRef.current = requestAnimationFrame(() => el.classList.remove(styles.no_hover));
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [pathname]);

  const handleNavEnter = () => {
    isHoveredRef.current = true;
    navRef.current?.closest('header')?.setAttribute('data-nav-hover', '');
  };

  const handleNavLeave = () => {
    isHoveredRef.current = false;
    navRef.current?.closest('header')?.removeAttribute('data-nav-hover');
    navRef.current?.classList.remove(styles.no_hover);
  };

  return (
    <nav
      ref={navRef}
      className={styles.desktop_nav}
      onMouseEnter={handleNavEnter}
      onMouseLeave={handleNavLeave}
    >
      <ul className={styles.list}>
        {navItems.map((item) => (
          <li key={item.path} className={styles.item}>
            <Link href={item.path} className={styles.link}>
              {item.label}
            </Link>

            {item.children?.length && (
              <ul className={styles.depth2}>
                {item.children.map((child) => (
                  <li key={child.path}>
                    <Link href={child.path} className={styles.depth2_link}>
                      {child.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
