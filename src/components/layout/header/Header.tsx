'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useProfile } from '@/context/SessionContextProvider';
import useModal from '@/hooks/useModal';
import Logo from '@/components/layout/header/Logo';
import AuthSection from '@/components/layout/header/AuthSection';
import DesktopNav from '@/components/layout/header/DesktopNav';
import MobileToggle from '@/components/layout/header/MobileToggle';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import Modal from '@/components/common/Modal';
import Drawer from '@/components/layout/header/Drawer';
import styles from './Header.module.scss';

export default function Header() {
  const user = useProfile();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const mobileToggleRef = useRef<HTMLDivElement>(null);

  const {
    isVisible: isProfileVisible,
    ref: profileRef,
    handleToggle: handleProfileToggle,
    setVisible: setProfileVisible
  } = useModal();

  useEffect(() => {
    setProfileVisible(false);
    setMobileOpen(false);
  }, [pathname, setProfileVisible]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 600 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  useLayoutEffect(() => {
    // @supports 미지원 브라우저 폴백: CSS scroll-driven animation이 없을 때 JS로 처리
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={clsx(styles.header, isScrolled && styles.scrolled)}>
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
          <MobileToggle ref={mobileToggleRef} handleToggle={() => setMobileOpen(true)} />
        </div>
      </LayoutContainer>
      {mobileOpen && (
        <Modal isVisible={mobileOpen} onClose={() => setMobileOpen(false)}>
          <Drawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        </Modal>
      )}
    </header>
  );
}
