'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useLayoutEffect, useState, useCallback } from 'react';
import { IoSearchOutline, IoNotificationsOutline, IoHeartOutline } from 'react-icons/io5';
import clsx from 'clsx';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import { GNB_ITEMS, isActiveGnb, type NavItem } from '@/config/navigation';
import { SCROLL_THRESHOLD } from '@/constants';
import styles from './Header.module.scss';

export default function DesktopHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState<string | null>(null);
  const [hoverSuppressed, setHoverSuppressed] = useState(false);

  // pathname 변경 시 mega menu 닫기 + hover 억제
  useEffect(() => {
    setKeyboardOpen(null);
    setHoverSuppressed(true);
  }, [pathname]);

  useLayoutEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, item: NavItem) => {
    if ((e.key === 'Enter' || e.key === ' ') && item.children?.length) {
      e.preventDefault();
      setKeyboardOpen((prev) => (prev === item.href ? null : item.href));
    }
    if (e.key === 'Escape') {
      setKeyboardOpen(null);
    }
  }, []);

  return (
    <div className={styles.desktop_header}>
      {/* ── Top Bar ── */}
      <div className={styles.top_bar}>
        <LayoutContainer className={styles.top_bar_inner}>
          <p className={styles.top_bar_slogan}>주님의 사랑으로 하나 되는 공동체</p>
          <div className={styles.top_bar_links}>
            <Link href="/about/location">오시는 길</Link>
            <Link href="/about/pastor">교회 소개</Link>
            <Link href="/login">로그인</Link>
          </div>
        </LayoutContainer>
      </div>

      {/* ── Main Header ── */}
      <header className={clsx(styles.main_header, isScrolled && styles.main_header_scrolled)}>
        <LayoutContainer className={styles.main_header_inner}>
          {/* 로고 */}
          <Link href="/" className={styles.logo}>
            <svg
              className={styles.logo_icon}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M11 2v5H6v2h5v13h2V9h5V7h-5V2z" />
            </svg>
            <span className={styles.logo_text}>대구동남교회</span>
          </Link>

          {/* GNB */}
          <nav className={styles.gnb} aria-label="메인 내비게이션">
            <ul className={clsx(styles.gnb_list, hoverSuppressed && styles.gnb_suppressed)}>
              {GNB_ITEMS.map((item) => {
                const active = isActiveGnb(pathname, item);
                const hasChildren = !!item.children?.length;
                const isOpen = keyboardOpen === item.href;

                return (
                  <li
                    key={item.href}
                    className={styles.gnb_item}
                    onMouseEnter={() => {
                      setKeyboardOpen(null);
                      setHoverSuppressed(false);
                    }}
                  >
                    <Link
                      href={item.href}
                      className={clsx(styles.gnb_link, active && styles.gnb_link_active)}
                      onKeyDown={(e) => handleKeyDown(e, item)}
                      aria-haspopup={hasChildren ? 'true' : undefined}
                      aria-expanded={hasChildren ? isOpen : undefined}
                    >
                      {item.label}
                    </Link>

                    {hasChildren && (
                      <ul className={clsx(styles.gnb_mega, isOpen && styles.gnb_mega_open)}>
                        {item.children!.map((child) => (
                          <li key={child.href}>
                            <Link
                              href={child.href}
                              className={styles.gnb_mega_link}
                              tabIndex={isOpen ? 0 : -1}
                            >
                              {child.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 유틸리티 */}
          <div className={styles.utility}>
            <Link href="/search" className={styles.utility_btn} aria-label="검색">
              <IoSearchOutline />
            </Link>
            <button type="button" className={styles.utility_btn} aria-label="알림">
              <IoNotificationsOutline />
            </button>
            <Link href="/about/welcome" className={styles.cta_btn}>
              <IoHeartOutline className={styles.cta_icon} />
              <span className={styles.cta_text}>처음 오셨나요?</span>
            </Link>
          </div>
        </LayoutContainer>
      </header>
    </div>
  );
}
