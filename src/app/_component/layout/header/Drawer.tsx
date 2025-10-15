import Link from 'next/link';
import { IoMdClose, IoIosArrowForward } from 'react-icons/io';
import UserProfile from '../../user/UserProfile';
import IconWrap from '../../common/IconWrap';
import { signOut } from '@/apis/auth';
import { sitemap } from '@/shared/constants/sitemap';
import { ProfileType } from '@/shared/types/types';
import styles from './Drawer.module.scss';

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileType | null;
  pathname: string;
};

export default function Drawer({ isOpen, onClose, user, pathname }: DrawerProps) {
  const { avatar_url = '', user_name = '', name = '' } = user ?? {};

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
          <Link
            href={{ pathname: '/login', query: { redirect: pathname } }}
            className={styles.login_btn}
          >
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
                  <IconWrap Icon={item.icon} />
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
