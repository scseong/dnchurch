'use client';

import { Select } from '@/components/ui';
import useSermonFilter from '@/hooks/useSermonFilter';
import type { SermonSortKey } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  resultCount: number;
  currentPage: number;
  totalPages: number;
};

export default function SermonResultHeader({
  resultCount,
  currentPage,
  totalPages
}: Props) {
  const { q, sort, setSort } = useSermonFilter();
  const trimmed = q.trim();
  const isActive = sort !== 'recent';

  return (
    <header className={styles.result_header}>
      <p className={styles.result_count}>
        {trimmed ? (
          <>
            <strong className={styles.result_query}>
              &ldquo;{trimmed}&rdquo;
            </strong>
            <span> 검색 결과 </span>
            <strong>{resultCount}</strong>
            <span>개</span>
          </>
        ) : (
          <>
            <span>총 </span>
            <strong>{resultCount}</strong>
            <span>개 설교</span>
          </>
        )}
        {totalPages > 1 && (
          <span className={styles.result_page_info}>
            · {currentPage} / {totalPages} 페이지
          </span>
        )}
      </p>
      {isActive && (
        <span className={styles.sort_label}>
          {sort === 'oldest' ? '오래된순' : '최신순'}
        </span>
      )}
      <Select
        className={styles.sort_select}
        value={sort}
        onChange={(value) => setSort(value as SermonSortKey)}
        options={[
          { value: 'recent', label: '정렬: 최신순' },
          { value: 'oldest', label: '정렬: 오래된순' }
        ]}
        emphasized={isActive}
        aria-label="설교 정렬"
      />
    </header>
  );
}
