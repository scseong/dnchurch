import Link from 'next/link';
import clsx from 'clsx';
import { IoEyeOutline, IoChevronForward } from 'react-icons/io5';
import { BsPinAngleFill, BsPaperclip } from 'react-icons/bs';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import { formattedDate, isRecent } from '@/utils/date';
import { Label } from '@/components/ui';
import type { NoticeType } from '@/types/notice';
import styles from './NoticeList.module.scss';

type Props = {
  data: NoticeType[];
};

export default function NoticeList({ data }: Props) {
  if (data.length === 0) {
    return <div className={styles.empty}>등록된 공지사항이 없습니다.</div>;
  }

  return (
    <ul className={styles.list}>
      {data.map((notice) => {
        const isUrgent = notice.category === '긴급';

        return (
          <li key={notice.id}>
            <Link
              href={`/news/notices/${notice.id}`}
              className={clsx(styles.row, notice.is_pinned && styles.pinned)}
            >
              <span className={styles.body}>
                <span className={styles.head}>
                  {notice.is_pinned && <BsPinAngleFill className={styles.pin} aria-hidden="true" />}
                  <Label size="xs" variant={isUrgent ? 'danger' : 'neutral'}>
                    {NOTICE_CATEGORIES[notice.category]}
                  </Label>
                  <span className={styles.title_wrap}>
                    <span className={styles.title}>{notice.title}</span>
                    {notice.attachment_url && (
                      <BsPaperclip className={styles.clip} aria-hidden="true" />
                    )}
                  </span>
                  {isRecent(notice.created_at) && (
                    <Label size="xs" variant="success">
                      NEW
                    </Label>
                  )}
                </span>

                <span className={styles.preview}>{notice.content}</span>

                <span className={styles.foot}>
                  <span className={styles.date}>{formattedDate(notice.created_at, 'YYYY. M. D')}</span>
                  <span className={styles.dot} aria-hidden="true">
                    ·
                  </span>
                  <span className={styles.views}>
                    <IoEyeOutline aria-hidden="true" />
                    {notice.view_count.toLocaleString()}
                  </span>
                </span>
              </span>

              <IoChevronForward className={styles.chevron} aria-hidden="true" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
