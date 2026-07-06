import styles from './gallery.module.scss';

type Props = {
  initial: string;
  // 성도별 아바타 배경색(데이터값). 테마 토큰이 아니라 Member.avatarColor에 해당해 inline으로 적용한다.
  color: string;
  size: 'lg' | 'sm';
};

export default function Avatar({ initial, color, size }: Props) {
  return (
    <span
      className={size === 'lg' ? styles.avatar_lg : styles.avatar_sm}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
