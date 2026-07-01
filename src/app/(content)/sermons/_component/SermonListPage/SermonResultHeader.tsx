'use client';

import { IoCloseCircle } from 'react-icons/io5';
import { Select } from '@/components/ui';
import useSermonFilter from '@/hooks/useSermonFilter';
import type { SermonSortKey } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

// 서버(page)가 해석해 넘기는 적용된 필터 — slug/name이 아닌 표시 라벨.
export type ActiveFilterChip = { type: 'series' | 'preacher'; label: string };

type Props = {
  resultCount: number;
  currentPage: number;
  totalPages: number;
  filterChips: ActiveFilterChip[];
};

export default function SermonResultHeader({
  resultCount,
  currentPage,
  totalPages,
  filterChips
}: Props) {
  const { q, sort, setSort, setFilter } = useSermonFilter();
  const trimmed = q.trim();
  const isActive = sort !== 'recent';
  // 검색어나 필터(시리즈·설교자)가 걸리면 '전체'가 아니므로 '검색 결과'로 표기(목업 일치).
  const hasCriteria = trimmed !== '' || filterChips.length > 0;

  // 적용된 검색·필터를 칩으로 모은다. 클릭 시 해당 조건만 해제(전체로 되돌아가는 수단).
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (trimmed) {
    chips.push({
      key: 'q',
      label: `‘${trimmed}’`,
      onRemove: () => setFilter({ q: null })
    });
  }
  for (const chip of filterChips) {
    chips.push({
      key: chip.type,
      label: chip.label,
      onRemove: () =>
        setFilter(chip.type === 'series' ? { series: null } : { preacher: null })
    });
  }

  return (
    <>
      {chips.length > 0 && (
        <div className={styles.chip_row}>
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              className={styles.filter_chip}
              onClick={chip.onRemove}
              aria-label={`${chip.label} 조건 지우기`}
            >
              <span>{chip.label}</span>
              <IoCloseCircle aria-hidden="true" />
            </button>
          ))}
        </div>
      )}
      <header className={styles.result_header}>
        <p className={styles.result_count}>
          <span>{hasCriteria ? '검색 결과 ' : '전체 설교 '}</span>
          <strong>{resultCount}</strong>
          <span>편</span>
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
    </>
  );
}
