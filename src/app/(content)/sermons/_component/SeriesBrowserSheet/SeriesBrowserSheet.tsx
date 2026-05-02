'use client';

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { IoClose, IoSearch } from 'react-icons/io5';
import BottomSheet from '@/components/common/BottomSheet/BottomSheet';
import { getSeriesByYearEntries } from '@/utils/sermon';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SeriesBrowserSheet.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  series: SeriesWithSermonCount[];
  /** null = 전체, 'none' = 단독 설교, slug = 시리즈 */
  activeSeries: string | null;
  onSelect: (key: string | null) => void;
  totalCount?: number;
  standaloneCount?: number;
};

export default function SeriesBrowserSheet({
  open,
  onClose,
  series,
  activeSeries,
  onSelect,
  totalCount = 0,
  standaloneCount = 0
}: Props) {
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) setKeyword('');
  }, [open]);

  const filteredSeries = useMemo(() => {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return series;
    return series.filter(
      (item) =>
        item.title.toLowerCase().includes(trimmed) ||
        (item.description ?? '').toLowerCase().includes(trimmed)
    );
  }, [keyword, series]);

  const yearEntries = useMemo(
    () => getSeriesByYearEntries(filteredSeries),
    [filteredSeries]
  );

  const handleSelect = (key: string | null) => {
    onSelect(key);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="시리즈 선택">
      <div className={styles.search}>
        <IoSearch className={styles.search_icon} aria-hidden="true" />
        <input
          type="text"
          className={styles.search_input}
          placeholder="시리즈 제목 또는 설명 검색"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        {keyword && (
          <button
            type="button"
            className={styles.search_clear}
            onClick={() => setKeyword('')}
            aria-label="검색어 지우기"
          >
            <IoClose />
          </button>
        )}
      </div>

      <ul className={styles.list}>
        <li>
          <button
            type="button"
            className={clsx(styles.item, activeSeries === null && styles.active)}
            onClick={() => handleSelect(null)}
          >
            <div className={styles.item_main}>
              <span className={styles.item_title}>전체 보기</span>
              <span className={styles.item_desc}>모든 설교를 표시합니다</span>
            </div>
            <span className={styles.badge}>{totalCount}편</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className={clsx(styles.item, activeSeries === 'none' && styles.active)}
            onClick={() => handleSelect('none')}
          >
            <div className={styles.item_main}>
              <span className={styles.item_title}>단독 설교</span>
              <span className={styles.item_desc}>시리즈에 속하지 않은 설교</span>
            </div>
            <span className={styles.badge}>{standaloneCount}편</span>
          </button>
        </li>
      </ul>

      {yearEntries.map(([yearKey, items]) => (
        <div key={yearKey} className={styles.group}>
          <h3 className={styles.group_title}>
            {yearKey === '미분류' ? '미분류' : `${yearKey}년`}
          </h3>
          <ul className={styles.list}>
            {items.map((item) => (
              <li key={item.slug}>
                <button
                  type="button"
                  className={clsx(styles.item, activeSeries === item.slug && styles.active)}
                  onClick={() => handleSelect(item.slug)}
                >
                  <div className={styles.item_main}>
                    <span className={styles.item_title}>{item.title}</span>
                    {item.description && (
                      <span className={styles.item_desc}>{item.description}</span>
                    )}
                  </div>
                  <span className={styles.badge}>{item.sermon_count}편</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {filteredSeries.length === 0 && (
        <p className={styles.empty}>검색 결과가 없습니다.</p>
      )}
    </BottomSheet>
  );
}
