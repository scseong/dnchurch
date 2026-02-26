import Link from 'next/link';
import UserProfile from '../../user/UserProfile';
import UserProfileModal from '../../user/UserProfileModal';
import { ProfileType } from '@/types/common';
import styles from './index.module.scss';

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
            avatarUrl={user.avatar_url}
            name={user.name}
            username={user.user_name}
            handleClick={handleToggle}
          />
          <UserProfileModal
            avatarUrl={user.avatar_url}
            name={user.name}
            username={user.user_name}
            id={user.id}
            isVisible={isVisible}
          />
        </div>
      )}
    </div>
  );
}
