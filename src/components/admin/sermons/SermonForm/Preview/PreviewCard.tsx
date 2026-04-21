import clsx from 'clsx';
import { HiOutlineEye, HiOutlinePhotograph } from 'react-icons/hi';
import type { SermonFormData } from '@/types/sermon-form';
import parent from '../index.module.scss';
import styles from './preview.module.scss';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatSermonDate(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (isNaN(date.getTime())) return '';
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`;
}

interface PreviewCardProps {
  data: SermonFormData;
}

export default function PreviewCard({ data }: PreviewCardProps) {
  const { title, sermonDate, preacherId, seriesId, summary, thumbnailUrl } = data;
  const metaParts = [formatSermonDate(sermonDate), preacherId].filter(Boolean);
  const seriesLabel = seriesId || '단독 설교';

  return (
    <section className={parent.card}>
      <header className={styles.preview_head}>
        <HiOutlineEye />
        <span>실시간 미리보기</span>
      </header>
      <div className={styles.preview_body}>
        <div className={styles.preview_thumb}>
          {thumbnailUrl ? (
            <img src={thumbnailUrl} alt="" />
          ) : (
            <div className={styles.preview_thumb_empty}>
              <HiOutlinePhotograph />
              <span>썸네일 없음</span>
            </div>
          )}
          <span className={styles.preview_thumb_tag}>{seriesLabel}</span>
        </div>
        {metaParts.length > 0 && (
          <p className={styles.preview_meta}>{metaParts.join(' · ')}</p>
        )}
        <h4 className={clsx(styles.preview_title, !title && styles.preview_title_empty)}>
          {title || '설교 제목을 입력하세요'}
        </h4>
        <div className={styles.preview_summary_block}>
          <p className={styles.preview_summary}>
            {summary || '설교 요약이 여기에 표시됩니다'}
          </p>
        </div>
      </div>
    </section>
  );
}
