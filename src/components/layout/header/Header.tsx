'use client';

import { useEffect, useState } from 'react';
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

  const {
    isVisible: isNavVisible,
    ref: navRef,
    handleToggle: handleNavToggle,
    setVisible: setNavVisible
  } = useModal();

  const {
    isVisible: isProfileVisible,
    ref: profileRef,
    handleToggle: handleProfileToggle,
    setVisible: setProfileVisible
  } = useModal();

  useEffect(() => {
    setNavVisible(false);
    setProfileVisible(false);
  }, [setNavVisible, setProfileVisible, pathname]);

  useEffect(() => {
    const handle_resize = () => {
      if (window.innerWidth >= 600 && isNavVisible) {
        setNavVisible(false);
      }
    };

    window.addEventListener('resize', handle_resize);
    return () => window.removeEventListener('resize', handle_resize);
  }, [isNavVisible, setNavVisible]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll);
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
          <MobileToggle ref={navRef} handleToggle={handleNavToggle} />
        </div>
      </LayoutContainer>
      <Modal isVisible={isNavVisible} onClose={handleNavToggle}>
        <Drawer isOpen={isNavVisible} onClose={handleNavToggle} />
      </Modal>
    </header>
  );
}
