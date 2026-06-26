import Link from 'next/link';
import { PiCaretRight } from 'react-icons/pi';
import { isRecent, formattedDate } from '@/utils/date';
import { Label } from '@/components/ui';
import type { NoticeType } from '@/types/notice';
import styles from './FeedContent.module.scss';

type Props = {
  notices: NoticeType[];
};

export default function FeedContent({ notices }: Props) {
  return (
    <div className={styles.column}>
      <div className={styles.list_card}>
        {notices.map((notice) => (
          <Link key={notice.id} href="/news/notices" className={styles.item}>
            <div className={styles.item_body}>
              <div className={styles.item_content}>
                <span className={styles.item_title_row}>
                  {isRecent(notice.created_at) && (
                    <Label size="xs" variant="success">
                      NEW
                    </Label>
                  )}
                  <span className={styles.item_category}>{notice.category}</span>
                  <span className={styles.item_title}>{notice.title}</span>
                </span>
                <span className={styles.item_date}>
                  {formattedDate(notice.created_at, 'YYYY.MM.DD')}
                </span>
              </div>
              <PiCaretRight className={styles.item_chevron} aria-hidden="true" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
