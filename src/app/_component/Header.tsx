'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GiHamburgerMenu } from 'react-icons/gi';
import Drawer from './Drawer';
import ModalOverlay from './common/ModalOverlay';
import UserProfile from './user/UserProfile';
import UserProfileModal from './user/UserProfileModal';
import { useProfile } from '@/context/SessionContextProvider';
import useModal from '@/hooks/useModal';
import useIsMobile from '@/hooks/useIsMobile';
import { sitemap } from '@/shared/constants/sitemap';
import styles from './Header.module.scss';

export default function Header() {
  const isMobile = useIsMobile();
  const { isVisible: isNavVisible, ref, handleToggle, setVisible } = useModal();
  const {
    isVisible: isProfileVisible,
    ref: profileRef,
    handleToggle: handleProfileToggle,
    setVisible: setProfileVisible
  } = useModal();
  const pathname = usePathname();
  const user = useProfile();

  useEffect(() => {
    setVisible(false);
    setProfileVisible(false);
  }, [setVisible, setProfileVisible, pathname]);

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
        <nav className={`${styles.nav} ${isNavVisible ? styles.visible : ''}`}>
          {!isMobile && (
            <ul>
              {sitemap
                .filter((item) => item.show)
                .map((item, index) => (
                  <li key={index}>
                    <Link href={item.path}>{item.label}</Link>
                  </li>
                ))}
            </ul>
          )}
        </nav>
        {/* <div className={`${styles.auth} ${isNavVisible ? styles.visible : ''}`}> */}
        <div className={`${styles.auth}`}>
          {/* TODO: 모달로 구현 */}
          {!user && <Link href="/login">로그인</Link>}
          {user && (
            <div className={styles.profile} ref={profileRef}>
              <UserProfile
                avatarUrl={user.avatar_url}
                name={user.name}
                username={user.user_name}
                handleClick={handleProfileToggle}
              />
              <UserProfileModal
                avatarUrl={user.avatar_url}
                name={user.name}
                username={user.user_name}
                id={user.id}
                isVisible={isProfileVisible}
              />
            </div>
          )}
        </div>
        <div className={styles.toggle} ref={ref}>
          <button onClick={handleToggle} aria-label="Toggle Navigation">
            <GiHamburgerMenu />
          </button>
          {isMobile && <Drawer isOpen={isNavVisible} onClose={handleToggle} user={user} />}
        </div>
      </div>
      <ModalOverlay isVisible={isNavVisible} />
    </header>
  );
}
