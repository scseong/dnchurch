'use client';

import { IoClose, IoSearch } from 'react-icons/io5';
import useSermonFilter from '@/hooks/useSermonFilter';
import styles from './SermonListPage.module.scss';

type Props = {
  resultCount: number;
};

export default function SermonSearchFeedback({ resultCount }: Props) {
  const { q, setFilter } = useSermonFilter();
  const trimmed = q.trim();

  if (trimmed.length === 0) return null;

  return (
    <section className={styles.search_feedback} aria-label="검색 결과 요약">
      <IoSearch className={styles.search_feedback_icon} aria-hidden="true" />
      <span className={styles.search_feedback_text}>
        <strong className={styles.search_feedback_query}>&ldquo;{trimmed}&rdquo;</strong>
        <span> 검색 결과 · </span>
        <strong className={styles.search_feedback_count}>{resultCount}개</strong>
      </span>
      <button
        type="button"
        className={styles.search_feedback_clear}
        onClick={() => setFilter({ q: null })}
      >
        <IoClose aria-hidden="true" />
        검색어 지우기
      </button>
    </section>
  );
}
