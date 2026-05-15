'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { IoCheckmark } from 'react-icons/io5';
import { BottomSheet, Button } from '@/components/ui';
import useSermonFilter from '@/hooks/useSermonFilter';
import { formatPreacherLabel } from '@/utils/sermon';
import type {
  PreacherWithSermonCount,
  SeriesWithSermonCount,
  SermonSortKey
} from '@/types/sermon';
import styles from './AdvancedFilterSheet.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
  allSeries: SeriesWithSermonCount[];
  allPreachers: PreacherWithSermonCount[];
};

type Draft = {
  series: string | null;
  preacher: string | null;
  sort: SermonSortKey;
};

export default function AdvancedFilterSheet({
  open,
  onClose,
  allSeries,
  allPreachers
}: Props) {
  const { series, preacher, sort, setFilter } = useSermonFilter();

  // 시트 안에서만 적용되는 staged state — "적용" 클릭 시에만 URL 갱신
  const [draft, setDraft] = useState<Draft>({ series, preacher, sort });

  // open transition 시점에만 현재 URL state를 draft에 동기화.
  // sheet 열려 있는 동안 외부 URL 변경은 staged 의도를 깨지 않도록 무시.
  useEffect(() => {
    if (open) setDraft({ series, preacher, sort });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleReset = () =>
    setDraft({ series: null, preacher: null, sort: 'recent' });

  const handleApply = () => {
    setFilter({
      series: draft.series,
      preacher: draft.preacher,
      sort: draft.sort === 'recent' ? null : draft.sort
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
      <section className={styles.section}>
        <h3 className={styles.section_title}>시리즈</h3>
        <ul role="list" className={styles.option_list}>
          <li>
            <FilterOption
              label="전체"
              selected={draft.series === null}
              onClick={() => setDraft((d) => ({ ...d, series: null }))}
            />
          </li>
          <li>
            <FilterOption
              label="단독 설교"
              selected={draft.series === 'none'}
              onClick={() => setDraft((d) => ({ ...d, series: 'none' }))}
            />
          </li>
          {allSeries.map((item) => (
            <li key={item.id}>
              <FilterOption
                label={item.title}
                selected={draft.series === item.slug}
                onClick={() => setDraft((d) => ({ ...d, series: item.slug }))}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.section_title}>설교자</h3>
        <ul role="list" className={styles.option_list}>
          <li>
            <FilterOption
              label="전체"
              selected={draft.preacher === null}
              onClick={() => setDraft((d) => ({ ...d, preacher: null }))}
            />
          </li>
          {allPreachers.map((item) => (
            <li key={item.id}>
              <FilterOption
                label={formatPreacherLabel(item)}
                selected={draft.preacher === item.name}
                onClick={() => setDraft((d) => ({ ...d, preacher: item.name }))}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h3 className={styles.section_title}>정렬</h3>
        <ul role="list" className={styles.option_list}>
          <li>
            <FilterOption
              label="최신순"
              selected={draft.sort === 'recent'}
              onClick={() => setDraft((d) => ({ ...d, sort: 'recent' }))}
            />
          </li>
          <li>
            <FilterOption
              label="오래된순"
              selected={draft.sort === 'oldest'}
              onClick={() => setDraft((d) => ({ ...d, sort: 'oldest' }))}
            />
          </li>
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
      className={clsx(styles.option, selected && styles.option_active)}
      onClick={onClick}
      aria-pressed={selected}
    >
      <span>{label}</span>
      {selected && <IoCheckmark aria-hidden="true" />}
    </button>
  );
}
