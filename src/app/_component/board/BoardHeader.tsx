import Link from 'next/link';
import { FiTrash, FiEdit } from 'react-icons/fi';
import KakaoShareBtn from '../common/KakaoShare';
import UserIdMatcher from '../auth/UserIdMatcher';
import { formattedDate } from '@/shared/util/date';
import styles from './BoardHeader.module.scss';

export default async function BoardHeader({
  title,
  userName,
  createdAt,
  userId,
  thumbnail,
  updateLink = '/'
  // onDelete
}: BoardHeaderProps) {
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
          <ul>
            {userId && (
              <>
                <UserIdMatcher userId={userId}>
                  <li>
                    <FiTrash />
                  </li>
                  <li>
                    <Link href={updateLink}>
                      <FiEdit />
                    </Link>
                  </li>
                </UserIdMatcher>
              </>
            )}
            <li>
              <KakaoShareBtn
                title={`${title} 주보 | 대구동남교회`}
                imageUrl={thumbnail}
                description=""
              />
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

type BoardHeaderProps = {
  id: string;
  title: string;
  userName: string;
  createdAt: string;
  userId: string;
  thumbnail: string;
  updateLink: string;
  onDelete: () => void;
};
