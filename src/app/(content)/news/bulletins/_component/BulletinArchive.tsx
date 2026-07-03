'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IoChevronForward,
  IoChevronDown,
  IoClose,
  IoCalendarClearOutline
} from 'react-icons/io5';
import clsx from 'clsx';
import { Pagination } from '@/components/ui';
import CreateBulletinButton from '@/app/(content)/news/bulletins/_component/CreateBulletinButton';
import MonthPickerSheet from '@/app/(content)/news/bulletins/_component/MonthPickerSheet';
import { ITEM_PER_PAGE } from '@/constants/bulletin';
import type { BulletinWithImages, MonthBuckets } from '@/types/bulletin';
import styles from './BulletinArchive.module.scss';

type Props = {
  items: BulletinWithImages[];
  total: number;
  currentPage: number;
  year?: number;
  month?: number;
  years: number[];
  monthBuckets: MonthBuckets;
};

/** '지난 주보' — 날짜칩 리스트 + '월별 보기' 바텀시트 + 페이지네이션. 필터는 URL(?year&month)로 나른다. */
export default function BulletinArchive({
  items,
  total,
  currentPage,
  year,
  month,
  years,
  monthBuckets
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const hasFilter = Boolean(year);
  const heading = month && year ? `${year}년 ${month}월` : year ? `${year}년` : '지난 주보';

  const applyMonth = useCallback(
    (nextYear: number, nextMonth: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('year', String(nextYear));
      params.set('month', String(nextMonth));
      params.delete('page');
      router.replace(`?${params.toString()}`, { scroll: false });
      setSheetOpen(false);
    },
    [searchParams, router]
  );

  const clearFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('year');
    params.delete('month');
    params.delete('page');
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : '?', { scroll: false });
    setSheetOpen(false);
  }, [searchParams, router]);

  return (
    <section className={styles.archive}>
      <div className={styles.head}>
        <h2 className={styles.title}>{heading}</h2>
        {hasFilter ? (
          <button type="button" className={styles.pill_active} onClick={clearFilter}>
            {heading}
            <span className={styles.pill_clear} aria-hidden="true">
              <IoClose />
            </span>
          </button>
        ) : (
          <button
            type="button"
            className={styles.pill}
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={sheetOpen}
          >
            <IoCalendarClearOutline aria-hidden="true" />
            월별 보기
            <IoChevronDown aria-hidden="true" />
          </button>
        )}
      </div>

      {items.length > 0 ? (
        <ul className={styles.list}>
          {items.map((bulletin, index) => {
            const [, listMonth, listDay] = bulletin.sunday_date.split('-');
            // 필터 없을 때 맨 위(가장 최근) 지난 주보만 골드로 강조 + '지난 주' 배지.
            const highlight = !hasFilter && index === 0;
            return (
              <li key={bulletin.id}>
                <Link
                  href={`/news/bulletins/${bulletin.id}`}
                  className={styles.row}
                  prefetch={false}
                >
                  <span className={clsx(styles.chip, highlight && styles.chip_hi)}>
                    <strong className={styles.chip_day}>{Number(listDay)}</strong>
                    <span className={styles.chip_month}>{Number(listMonth)}월</span>
                  </span>
                  <span className={styles.row_title}>{bulletin.title}</span>
                  {highlight && <span className={styles.recent_badge}>지난 주</span>}
                  <IoChevronForward className={styles.chevron} aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className={styles.empty}>
          {hasFilter ? '해당 기간의 주보가 없습니다.' : '지난 주보가 없습니다.'}
        </div>
      )}

      <Pagination
        totalCount={total}
        currentPage={currentPage}
        pageSize={ITEM_PER_PAGE}
        maxVisiblePages={5}
      />

      <CreateBulletinButton />

      <MonthPickerSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        years={years}
        monthBuckets={monthBuckets}
        selectedYear={year}
        selectedMonth={month}
        onSelect={applyMonth}
        onClear={clearFilter}
      />
    </section>
  );
}
