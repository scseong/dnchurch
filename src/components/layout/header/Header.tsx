'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useProfile } from '@/context/SessionContextProvider';
import useModal from '@/hooks/useModal';
import { sitemap } from '@/constants/sitemap';
import Logo from '@/components/layout/header/Logo';
import AuthSection from '@/components/layout/header/AuthSection';
import DesktopNav from '@/components/layout/header/DesktopNav';
import MobileToggle from '@/components/layout/header/MobileToggle';
import LnbPanel from '@/components/layout/header/LnbPanel';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import Modal from '@/components/common/Modal';
import Drawer from '@/components/layout/header/Drawer';
import styles from './Header.module.scss';

export default function Header() {
  const user = useProfile();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobileToggleRef = useRef<HTMLDivElement>(null);

  const navItems = sitemap.filter((item) => item.inNav);

  const {
    isVisible: isProfileVisible,
    ref: profileRef,
    handleToggle: handleProfileToggle,
    setVisible: setProfileVisible
  } = useModal();

  useEffect(() => {
    setProfileVisible(false);
    setMobileOpen(false);
    setActiveIndex(null);
  }, [pathname, setProfileVisible]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 600 && mobileOpen) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const startCloseTimer = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    leaveTimer.current = setTimeout(() => setActiveIndex(null), 80);
  };

  const cancelCloseTimer = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
  };

  const handleNavItemEnter = (index: number) => {
    cancelCloseTimer();
    setActiveIndex(index);
  };

  return (
    <header
      className={clsx(styles.header, isScrolled && styles.scrolled)}
      onMouseLeave={startCloseTimer}
    >
      <LayoutContainer>
        <div className={styles.header_wrap}>
          <Logo />
          <DesktopNav
            activeIndex={activeIndex}
            onItemEnter={handleNavItemEnter}
            onNavLeave={startCloseTimer}
            onLnbEnter={cancelCloseTimer}
            onLnbLeave={startCloseTimer}
          />
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

      {activeIndex !== null && (
        <LnbPanel onMouseEnter={cancelCloseTimer} onMouseLeave={startCloseTimer} />
      )}

      {mobileOpen && (
        <Modal isVisible={mobileOpen} onClose={() => setMobileOpen(false)}>
          <Drawer isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
        </Modal>
      )}
    </header>
  );
}
