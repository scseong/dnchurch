import styles from './UserProfile.module.scss';

type UserProfileProps = {
  avatarUrl: string;
  name?: string;
  username?: string;
  fontSize?: string;
  imageSize?: string;
  showInfo?: boolean;
  handleClick?: (event: React.MouseEvent<HTMLDivElement | HTMLButtonElement, MouseEvent>) => void;
};

export default function UserProfile({
  avatarUrl,
  name,
  username,
  imageSize = '3.6rem',
  fontSize = '1.2rem',
  showInfo = false,
  handleClick
}: UserProfileProps) {
  return (
    <div className={styles.profile} onClick={handleClick}>
      <div className={styles.profile_image} style={{ width: imageSize, height: imageSize }}>
        <img src={avatarUrl} alt={`${name}님의 프로필 이미지`} />
      </div>
      {showInfo && (
        <div className={styles.info} style={{ fontSize }}>
          <span>@{username}</span>
          <span className={styles.name}>{name}</span>
        </div>
      )}
    </div>
  );
}
