'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import styles from './Header.module.scss';
import { GiHamburgerMenu } from 'react-icons/gi';
import { usePathname } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { sitemap } from '@/shared/constants/sitemap';
import UserProfile from './user/UserProfile';
import ModalOverlay from './common/ModalOverlay';
import useModal from '../hooks/useModal';

type HeaderProps = {
  user?: User | UserWithCustomMetadata | null;
};

type UserWithCustomMetadata = Omit<User, 'user_metadata'> & {
  user_metadata: UserMetadata;
};

export type UserMetadata = {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;
  name: string;
  phone_verified: boolean;
  preferred_username: string;
  provider_id: string;
  sub: string;
  user_name: string;
};

export default function Header({ user }: HeaderProps) {
  const { isVisible: isNavVisible, ref, handleToggle, setVisible } = useModal();
  const pathname = usePathname();
  const isLoggedIn = !!user?.email;

  useEffect(() => {
    setVisible(false);
  }, [setVisible, pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.header_wrap} ref={ref}>
        <div className={styles.logo}>
          <h1>
            <Link href="/">
              {/* TODO: 로고 이미지로 대체 */}
              대구동남교회
            </Link>
          </h1>
        </div>
        <nav className={`${styles.nav} ${isNavVisible ? styles.visible : ''}`}>
          <ul>
            {sitemap
              .filter((item) => item.show)
              .map((item, index) => (
                <li key={index}>
                  <Link href={item.path}>{item.label}</Link>
                </li>
              ))}
          </ul>
        </nav>
        <div className={`${styles.auth} ${isNavVisible ? styles.visible : ''}`}>
          {/* TODO: 모달로 구현 */}
          {!isLoggedIn && <Link href="/login">로그인</Link>}
          {isLoggedIn && (
            <UserProfile
              avatarUrl={user.user_metadata.avatar_url}
              name={user.user_metadata.name}
              username={user.user_metadata.user_name}
            />
          )}
        </div>
        <div className={styles.toggle}>
          <button onClick={handleToggle} aria-label="Toggle Navigation">
            <GiHamburgerMenu />
          </button>
        </div>
      </div>
      <ModalOverlay isVisible={isNavVisible} />
    </header>
  );
}
