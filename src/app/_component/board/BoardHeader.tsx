import Link from 'next/link';
import { FiTrash, FiEdit } from 'react-icons/fi';
import KakaoShareBtn from '../common/KakaoShare';
import UserIdMatcher from '../auth/UserIdMatcher';
import { formattedDate } from '@/utils/date';
import styles from './BoardHeader.module.scss';

type Props = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  userId: string;
  thumbnail: string;
  updateLink: string;
  onDelete?: () => void;
};

export default async function BoardHeader({
  title,
  userName,
  createdAt,
  userId,
  thumbnail,
  updateLink = '/'
}: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.title}>
        <h4>{title}</h4>
      </div>
      <div className={styles.info}>
        <div className={styles.left}>
          <dl>
            <dt>작성자</dt>
            <dd>{userName}</dd>
          </dl>
          <dl>
            <dt>등록일</dt>
            <dd>{formattedDate(createdAt, 'YY.MM.DD')}</dd>
          </dl>
        </div>
        <div className={styles.right}>
          <ul className={styles.icons}>
            <UserIdMatcher userId={userId}>
              <li>
                <FiTrash size="2rem" />
              </li>
              <li>
                <Link href={updateLink}>
                  <FiEdit size="2rem" />
                </Link>
              </li>
            </UserIdMatcher>
            <li>
              <KakaoShareBtn
                title={`${title} | 대구동남교회`}
                imageUrl={thumbnail}
                description=""
                size="30"
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
