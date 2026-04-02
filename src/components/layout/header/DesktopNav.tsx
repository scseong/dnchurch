'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { sitemap } from '@/constants/sitemap';
import styles from './DesktopNav.module.scss';

export default function DesktopNav() {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const rafRef = useRef<number>(0);
  const isHoveredRef = useRef(false);
  const lockedItemRef = useRef<string | null>(null);
  const hoveredItemRef = useRef<string | null>(null);

  const navItems = sitemap.filter((item) => item.inNav);

  const lockNav = (el: HTMLElement) => {
    el.classList.add(styles.no_hover);
    el.closest('header')?.setAttribute('data-nav-locked', '');
  };

  const unlockNav = (el: HTMLElement) => {
    el.classList.remove(styles.no_hover);
    el.closest('header')?.removeAttribute('data-nav-locked');
  };

  const handleNavEnter = () => {
    isHoveredRef.current = true;
  };

  const handleNavLeave = () => {
    isHoveredRef.current = false;
    hoveredItemRef.current = null;
    lockedItemRef.current = null;
    if (navRef.current) unlockNav(navRef.current);
  };

  const handleItemEnter = (path: string) => {
    hoveredItemRef.current = path;
    const el = navRef.current;
    if (!el?.classList.contains(styles.no_hover)) return;

    if (lockedItemRef.current !== path) {
      lockedItemRef.current = null;
      unlockNav(el);
    }
  };

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;

    lockNav(el);

    if (!isHoveredRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        unlockNav(el);
        lockedItemRef.current = null;
      });
    } else {
      lockedItemRef.current = hoveredItemRef.current;
    }

    return () => cancelAnimationFrame(rafRef.current);
  }, [pathname]);

  return (
    <nav
      ref={navRef}
      id="gnb"
      className={styles.desktop_nav}
      onMouseEnter={handleNavEnter}
      onMouseLeave={handleNavLeave}
    >
      <ul className={styles.list}>
        {navItems.map((item) => (
          <li
            key={item.path}
            className={styles.item}
            onMouseEnter={() => handleItemEnter(item.path)}
          >
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
