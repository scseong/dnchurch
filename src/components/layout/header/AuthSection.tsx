import Link from 'next/link';
import UserProfile from '../../../app/_component/user/UserProfile';
import UserProfileModal from '../../../app/_component/user/UserProfileModal';
import { ProfileType } from '@/types/common';
import styles from './AuthSection.module.scss';

type Props = {
  ref: React.RefObject<HTMLDivElement>;
  user: ProfileType | null;
  isVisible: boolean;
  pathname: string;
  handleToggle: () => void;
};

export default function AuthSection({ ref, user, pathname, isVisible, handleToggle }: Props) {
  return (
    <div className={styles.auth}>
      {!user ? (
        <Link href={{ pathname: '/login', query: { redirect: pathname } }}>로그인</Link>
      ) : (
        <div className={styles.profile} ref={ref}>
          <UserProfile
            name={user.name}
            username={user.display_name ?? user.name}
            handleClick={handleToggle}
          />
          <UserProfileModal
            name={user.name}
            username={user.display_name ?? user.name}
            id={user.id}
            isVisible={isVisible}
          />
        </div>
      )}
    </div>
  );
}
