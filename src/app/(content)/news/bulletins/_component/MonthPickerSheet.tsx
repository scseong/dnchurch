'use client';

import { useState } from 'react';
import clsx from 'clsx';
import { BottomSheet } from '@/components/ui';
import type { MonthBuckets } from '@/types/bulletin';
import styles from './MonthPickerSheet.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  years: number[];
  monthBuckets: MonthBuckets;
  selectedYear?: number;
  selectedMonth?: number;
  onSelect: (year: number, month: number) => void;
  onClear: () => void;
};

const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

/** 월별 보기 바텀시트 — 연도 칩으로 연도를 고르고, 12개월 그리드에서 주보 있는 달을 고른다. */
export default function MonthPickerSheet({
  open,
  onClose,
  years,
  monthBuckets,
  selectedYear,
  selectedMonth,
  onSelect,
  onClear
}: Props) {
  const [pickYear, setPickYear] = useState<number | undefined>(selectedYear ?? years[0]);

  // 시트가 열릴 때 선택 연도로 되돌린다 (렌더 중 prev-state 보정).
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setPickYear(selectedYear ?? years[0]);
  }

  const counts = pickYear != null ? monthBuckets[pickYear] ?? {} : {};

  return (
    <BottomSheet open={open} onClose={onClose} title="월별 주보 찾기" enableHistory>
      <p className={styles.desc}>지난 주보를 월 단위로 찾아보세요.</p>

      {years.length > 0 && (
        <div className={styles.years}>
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={clsx(styles.year, year === pickYear && styles.year_active)}
              onClick={() => setPickYear(year)}
              aria-pressed={year === pickYear}
            >
              {year}년
            </button>
          ))}
        </div>
      )}

      <div className={styles.grid}>
        {MONTHS.map((month) => {
          const count = counts[month] ?? 0;
          const has = count > 0;
          const active = pickYear === selectedYear && month === selectedMonth;
          return (
            <button
              key={month}
              type="button"
              className={clsx(styles.cell, active && styles.cell_active, !has && styles.cell_empty)}
              disabled={!has}
              onClick={() => {
                if (pickYear != null) onSelect(pickYear, month);
              }}
            >
              <span className={styles.cell_month}>{month}월</span>
              <span className={styles.cell_count}>{has ? `${count}개` : '—'}</span>
            </button>
          );
        })}
      </div>

      <button type="button" className={styles.all} onClick={onClear}>
        전체 주보 보기
      </button>
    </BottomSheet>
  );
}
