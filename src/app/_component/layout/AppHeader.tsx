'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useProfile } from '@/context/SessionContextProvider';
import useIsMobile from '@/hooks/useIsMobile';
import useModal from '@/hooks/useModal';
import { LayoutContainer } from './common';
import Modal from '../common/Modal';
import { Logo, AuthSection, DesktopNav, MobileToggle, Drawer } from './header';
import styles from './header/index.module.scss';

export default function AppHeader() {
  const isMobile = useIsMobile();
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
          <DesktopNav isVisible={!isMobile} />
          {/* TODO: FOUC 해결 */}
          <AuthSection
            ref={profileRef}
            user={user}
            pathname={pathname}
            isVisible={isProfileVisible}
            handleToggle={handleProfileToggle}
          />
          <MobileToggle ref={navRef} isMobile={isMobile} handleToggle={handleNavToggle} />
        </div>
      </LayoutContainer>
      {isNavVisible && (
        <Modal>
          <Drawer isOpen={isNavVisible} onClose={handleNavToggle} user={user} pathname={pathname} />
        </Modal>
      )}
    </header>
  );
}
