'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { IoCheckmark } from 'react-icons/io5';
import { BottomSheet, Button } from '@/components/ui';
import useSeriesFilter from '@/hooks/useSeriesFilter';
import { getSeriesYearOptions, type SeriesStatusFilter } from '@/utils/sermon';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SeriesListPage.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  allSeries: SeriesWithSermonCount[];
};

type Draft = {
  status: SeriesStatusFilter | null;
  year: number | null;
};

function parseStatus(raw: string | null): SeriesStatusFilter | null {
  return raw === 'active' || raw === 'ended' ? raw : null;
}

export default function SeriesFilterBottomSheet({
  open,
  onClose,
  allSeries
}: Props) {
  const { status, year, setFilter } = useSeriesFilter();
  const yearOptions = getSeriesYearOptions(allSeries);

  const [draft, setDraft] = useState<Draft>({
    status: parseStatus(status),
    year: year ? Number(year) : null
  });

  // open 시점에만 현재 URL state를 draft에 동기화 — 시트 열린 동안 staged 의도 보존
  useEffect(() => {
    if (open) {
      setDraft({
        status: parseStatus(status),
        year: year ? Number(year) : null
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleReset = () => setDraft({ status: null, year: null });

  const handleApply = () => {
    setFilter({
      status: draft.status,
      year: draft.year != null ? String(draft.year) : null
    });
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="필터"
      footer={
        <>
          <Button variant="secondary" fullWidth onClick={handleReset}>
            초기화
          </Button>
          <Button fullWidth onClick={handleApply}>
            적용
          </Button>
        </>
      }
    >
      <section className={styles.sheet_section}>
        <h3 className={styles.sheet_title}>상태</h3>
        <ul role="list" className={styles.sheet_option_list}>
          {(
            [
              { value: null, label: '전체' },
              { value: 'active', label: '진행 중' },
              { value: 'ended', label: '완료' }
            ] as { value: SeriesStatusFilter | null; label: string }[]
          ).map((option) => (
            <li key={option.label}>
              <FilterOption
                label={option.label}
                selected={draft.status === option.value}
                onClick={() => setDraft((d) => ({ ...d, status: option.value }))}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.sheet_section}>
        <h3 className={styles.sheet_title}>연도</h3>
        <ul role="list" className={styles.sheet_option_list}>
          <li>
            <FilterOption
              label="전체"
              selected={draft.year === null}
              onClick={() => setDraft((d) => ({ ...d, year: null }))}
            />
          </li>
          {yearOptions.map((option) => (
            <li key={option}>
              <FilterOption
                label={`${option}년`}
                selected={draft.year === option}
                onClick={() => setDraft((d) => ({ ...d, year: option }))}
              />
            </li>
          ))}
        </ul>
      </section>
    </BottomSheet>
  );
}

function FilterOption({
  label,
  selected,
  onClick
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={clsx(styles.sheet_option, selected && styles.sheet_option_active)}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>{label}</span>
      {selected && <IoCheckmark aria-hidden="true" />}
    </button>
  );
}
