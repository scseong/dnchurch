import Link from 'next/link';
import UserProfile from './UserProfile';
import { AiOutlineUser, AiOutlineLogout } from 'react-icons/ai';
import { signOut } from '@/apis/auth';
import styles from './UserProfileModal.module.scss';

type UserProfileModal = {
  isVisible: boolean;
  avatarUrl: string;
  name: string;
  username: string;
  id: string;
};

export default function UserProfileModal({
  isVisible,
  avatarUrl,
  name,
  username,
  id
}: UserProfileModal) {
  if (!isVisible) return null;

  return (
    <div className={styles.modal}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          <UserProfile
            avatarUrl={avatarUrl}
            name={name}
            username={username}
            imageSize="3.4rem"
            showInfo
          />
        </div>
        <div className={styles.divide}></div>
        <div className={styles.menu}>
          <div>
            <Link href={`/mypage/${id}`}>
              <AiOutlineUser />
              <span>내 정보</span>
            </Link>
          </div>
          <div>
            <button onClick={signOut}>
              <AiOutlineLogout />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
