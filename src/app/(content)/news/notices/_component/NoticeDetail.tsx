import Link from 'next/link';
import clsx from 'clsx';
import { IoEyeOutline, IoChevronUp, IoChevronDown, IoDownloadOutline } from 'react-icons/io5';
import { HiOutlineDocumentText } from 'react-icons/hi2';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import { formattedDate } from '@/utils/date';
import { Label } from '@/components/ui';
import type { NoticeType } from '@/types/notice';
import styles from './NoticeDetail.module.scss';

type AdjacentNotice = { id: number; title: string } | null;

type Props = {
  notice: NoticeType;
  prev?: AdjacentNotice;
  next?: AdjacentNotice;
};

// 첨부 URL에서 파일명만 뽑는다. 쿼리스트링·인코딩 제거.
function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url, 'https://x').pathname;
    return decodeURIComponent(path.split('/').pop() || '첨부파일');
  } catch {
    return '첨부파일';
  }
}

export default function NoticeDetail({ notice, prev, next }: Props) {
  const isUrgent = notice.category === '긴급';

  return (
    <article className={styles.detail}>
      <header className={styles.head}>
        <h1 className={styles.title}>
          <Label
            size="xs"
            variant={isUrgent ? 'danger' : 'neutral'}
            className={styles.title_badge}
          >
            {NOTICE_CATEGORIES[notice.category]}
          </Label>
          {notice.title}
        </h1>
        <div className={styles.meta}>
          <time className={styles.date} dateTime={notice.created_at}>
            {formattedDate(notice.created_at, 'YYYY. M. D')}
          </time>
          <span className={styles.views}>
            <IoEyeOutline aria-hidden="true" />
            {notice.view_count.toLocaleString()}
          </span>
        </div>
      </header>

      <div className={styles.body}>{notice.content}</div>

      {notice.attachment_url && (
        <a
          href={notice.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.attachment}
        >
          <span className={styles.file_icon} aria-hidden="true">
            <HiOutlineDocumentText />
          </span>
          <span className={styles.file_info}>
            <span className={styles.file_name}>{fileNameFromUrl(notice.attachment_url)}</span>
            <span className={styles.file_sub}>첨부파일 · 클릭하여 저장</span>
          </span>
          <IoDownloadOutline className={styles.file_download} aria-hidden="true" />
        </a>
      )}

      <nav className={styles.adjacent} aria-label="이전·다음 글">
        <AdjacentRow direction="prev" notice={prev} />
        <AdjacentRow direction="next" notice={next} />
      </nav>
    </article>
  );
}

function AdjacentRow({ direction, notice }: { direction: 'prev' | 'next'; notice?: AdjacentNotice }) {
  const label = direction === 'prev' ? '이전 글' : '다음 글';
  const Icon = direction === 'prev' ? IoChevronUp : IoChevronDown;

  if (!notice) {
    return (
      <div className={clsx(styles.adjacent_row, styles.adjacent_empty)}>
        <span className={styles.adjacent_label}>
          <Icon aria-hidden="true" />
          {label}
        </span>
        <span className={styles.adjacent_none}>없음</span>
      </div>
    );
  }

  return (
    <Link href={`/news/notices/${notice.id}`} className={styles.adjacent_row}>
      <span className={styles.adjacent_label}>
        <Icon aria-hidden="true" />
        {label}
      </span>
      <span className={styles.adjacent_title}>{notice.title}</span>
    </Link>
  );
}
