import Link from 'next/link';
import { PiCaretRight } from 'react-icons/pi';
import { getRevealStyle } from '@/utils/reveal';
import { isRecent, formattedDate } from '@/utils/date';
import { NOTICE_CATEGORY_VARIANT } from '@/constants/notice';
import { Label } from '@/components/ui';
import type { NoticeType } from '@/types/notice';
import styles from './FeedContent.module.scss';

type Props = {
  notices: NoticeType[];
};

export default function FeedContent({ notices }: Props) {
  return (
    <>
      <div className={styles.column}>
        <div className={styles.column_header} data-reveal style={getRevealStyle(1)}>
          <h3 className={styles.column_title}>
            <span className={styles.color_bar_news} />
            교회 소식
          </h3>
          <Link href="/news/notices" className={styles.more_link}>
            더 보기 →
          </Link>
        </div>
        <div className={styles.list_card}>
          {notices.map((notice, i) => (
            <Link
              key={notice.id}
              href="/news/notices"
              className={styles.item}
              data-reveal
              style={getRevealStyle(i)}
            >
              <div className={styles.item_body}>
                <div className={styles.item_content}>
                  <span className={styles.item_title_row}>
                    {isRecent(notice.created_at) && (
                      <Label size="xs" variant="success">NEW</Label>
                    )}
                    <span className={styles.item_title}>{notice.title}</span>
                  </span>
                  <span className={styles.item_meta}>
                    <Label size="xs" variant={NOTICE_CATEGORY_VARIANT[notice.category]}>
                      {notice.category}
                    </Label>
                    <span className={styles.item_date}>
                      {formattedDate(notice.created_at, 'YYYY.MM.DD')}
                    </span>
                  </span>
                </div>
                <PiCaretRight className={styles.item_chevron} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Link
        href="/news/notices"
        className={styles.more_button}
        data-reveal
        style={getRevealStyle(notices.length)}
      >
        더 보기
      </Link>
    </>
  );
}
