'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/context/SessionContextProvider';
import useModal from '@/hooks/useModal';
import { LayoutContainer } from './common';
import Modal from '../common/Modal';
import { Logo, AuthSection, DesktopNav, MobileToggle, Drawer } from './header';
import styles from './header/index.module.scss';

export default function AppHeader() {
  const user = useProfile();
  const pathname = usePathname();

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

  return (
    <header className={styles.header}>
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
        <Drawer isOpen={isNavVisible} onClose={handleNavToggle} user={user} pathname={pathname} />
      </Modal>
    </header>
  );
}
