import Link from 'next/link';
import { IoMdClose, IoIosArrowForward } from 'react-icons/io';
import UserProfile from './user/UserProfile';
import IconContainer from './common/IconContainer';
import { signOut } from '@/apis/auth';
import { sitemap } from '@/shared/constants/sitemap';
import { UserProps } from '@/shared/types/types';
import styles from './Drawer.module.scss';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  user: UserProps;
};

export default function Drawer({ isOpen, onClose, user }: DrawerProps) {
  const { avatar_url = '', user_name = '', name = '' } = user?.user_metadata ?? {};

  return (
    <aside className={`${styles.drawer} ${isOpen ? styles.animate : styles.hidden}`}>
      <div className={styles.top}>
        <button onClick={onClose}>
          <IoMdClose />
        </button>
      </div>
      <div className={styles.profile}>
        {user && (
          <>
            <UserProfile
              avatarUrl={avatar_url}
              imageSize="4rem"
              username={user_name}
              name={name}
              showInfo
            />
            <Link href={`/mypage/${user.id}`}>
              <IoIosArrowForward size="2rem" />
            </Link>
          </>
        )}
        {!user && (
          <Link href="/login" className={styles.login_btn}>
            로그인
          </Link>
        )}
      </div>
      <nav className={styles.nav}>
        <ul className={styles.nav_list}>
          {sitemap
            .filter((item) => item.show)
            .map((item) => (
              <li key={item.path}>
                <Link href={item.path}>
                  <IconContainer>
                    <item.icon />
                  </IconContainer>
                  <span>{item.label}</span>
                </Link>
                {item.subPath && item.subPath?.length > 0 && (
                  <ul className={styles.subnav_list}>
                    {item.subPath.map((subItem) => (
                      <li key={subItem.path}>
                        <Link href={subItem.path}>{subItem.label}</Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
        </ul>
      </nav>
      {user && (
        <div className={styles.bottom}>
          <button onClick={signOut}>로그아웃</button>
        </div>
      )}
    </aside>
  );
}
