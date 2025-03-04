import { formattedDate } from '@/shared/util/date';
import { FiTrash, FiEdit } from 'react-icons/fi';
import styles from './BoardHeader.module.scss';
import KakaoShareBtn from '../common/KakaoShare';

export default async function BoardHeader({
  title,
  userName,
  createdAt,
  userId,
  thumbnail
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
                <li>
                  <FiTrash />
                </li>
                <li>
                  <FiEdit />
                </li>
              </>
            )}
            <li>
              <KakaoShareBtn
                title={`${title} - 대구동남교회`}
                imageUrl={thumbnail}
                description=""
                size="1.5rem"
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
};
