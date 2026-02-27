'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/context/SessionContextProvider';
import useModal from '@/hooks/useModal';
import Modal from '@/components/common/Modal';
import Logo from '@/components/layout/header/Logo';
import AuthSection from '@/components/layout/header/AuthSection';
import DesktopNav from '@/components/layout/header/DesktopNav';
import MobileToggle from '@/components/layout/header/MobileToggle';
import Drawer from '@/components/layout/header/Drawer';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import styles from './Header.module.scss';

export default function Header() {
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
