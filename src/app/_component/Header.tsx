'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './Header.module.scss';
import { GiHamburgerMenu } from 'react-icons/gi';

export default function Header() {
  const [isNavVisible, setNavVisible] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  const toggleNav = () => {
    setNavVisible((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent | PointerEvent) => {
    if (navRef.current && !navRef.current.contains(event.target as Node)) {
      setNavVisible(false);
    }
  };

  useEffect(() => {
    if (isNavVisible) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isNavVisible]);

  return (
    <header className={styles.header}>
      <div className={styles.header_wrap}>
        <div className={styles.logo}>
          <h1>
            <Link href="/">
              {/* TODO: 로고 이미지로 대체 */}
              대구동남교회
            </Link>
          </h1>
        </div>
        <nav className={`${styles.nav} ${isNavVisible ? styles.visible : ''}`} ref={navRef}>
          <ul>
            <li>
              <Link href="/about">교회소개</Link>
            </li>
            <li>
              <Link href="/news">교회소식</Link>
            </li>
            <li>
              <Link href="/fellowship">교제</Link>
            </li>
            <li>
              <Link href="/gallery">동남앨범</Link>
            </li>
          </ul>
        </nav>
        <div className={`${styles.auth} ${isNavVisible ? styles.visible : ''}`}>
          <ul>
            <li>
              {/* TODO: 모달로 구현 */}
              <Link href="/login">로그인</Link>
            </li>
            <li>회원가입</li>
          </ul>
        </div>
        <div className={styles.toggle}>
          <button onClick={toggleNav} aria-label="Toggle Navigation">
            <GiHamburgerMenu size="1rem" />
          </button>
        </div>
      </div>
      {isNavVisible && <div className={styles.overlay} />}
    </header>
  );
}
