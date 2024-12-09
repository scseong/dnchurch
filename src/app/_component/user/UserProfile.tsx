import styles from './UserProfile.module.scss';

type UserProfileProps = {
  avatarUrl: string;
  name?: string;
  username?: string;
  imageSize?: string;
  showInfo?: boolean;
};

export default function UserProfile({
  avatarUrl,
  name,
  username,
  imageSize = '3.6rem',
  showInfo = false
}: UserProfileProps) {
  return (
    <div className={styles.profile}>
      <div>
        <div className={styles.profile_image} style={{ width: imageSize, height: imageSize }}>
          <img src={avatarUrl} alt={`${name}님의 프로필 이미지`} />
        </div>
      </div>
      {showInfo && (
        <div className={styles.info}>
          <span>{username}</span>
          <span className={styles.name}>{name}</span>
        </div>
      )}
    </div>
  );
}
