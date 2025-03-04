import { formattedDate } from '@/shared/util/date';
import styles from './BoardHeader.module.scss';

export default function BoardHeader({ title, userName, createdAt, userId }: BoardHeaderProps) {
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
                <li>삭제</li>
                <li>수정</li>
              </>
            )}
            <li>공유</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

type BoardHeaderProps = {
  title: string;
  userName: string;
  createdAt: string;
  userId: string;
};
