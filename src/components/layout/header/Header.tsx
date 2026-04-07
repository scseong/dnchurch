'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useProfile } from '@/context/SessionContextProvider';
import useModal from '@/hooks/useModal';
import Logo from '@/components/layout/header/Logo';
import DesktopNav from '@/components/layout/header/DesktopNav';
import AuthSection from '@/components/layout/header/AuthSection';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import { SCROLL_THRESHOLD } from '@/constants';
import styles from './Header.module.scss';

export default function Header() {
  const user = useProfile();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);

  const mobileToggleRef = useRef<HTMLDivElement>(null);

  const {
    isVisible: isProfileVisible,
    ref: profileRef,
    handleToggle: handleProfileToggle,
    setVisible: setProfileVisible
  } = useModal();

  useEffect(() => {
    setProfileVisible(false);
  }, [pathname, setProfileVisible]);

  useLayoutEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
    handleScroll();
    document.documentElement.removeAttribute('data-scrolled');
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={clsx(styles.header, isScrolled && styles.scrolled)} ref={mobileToggleRef}>
      <LayoutContainer>
        <div className={styles.header_wrap}>
          <Logo />
          <DesktopNav />
          <AuthSection
            ref={profileRef}
            user={user}
            pathname={pathname}
            isVisible={isProfileVisible}
            handleToggle={handleProfileToggle}
          />
        </div>
      </LayoutContainer>
    </header>
  );
}
