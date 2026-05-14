'use client';

import clsx from 'clsx';
import { IoCheckmark } from 'react-icons/io5';
import { BottomSheet, Button } from '@/components/ui';
import useSermonFilter from '@/hooks/useSermonFilter';
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

export default function AdvancedFilterSheet({
  open,
  onClose,
  allSeries,
  allPreachers
}: Props) {
  const { series, preacher, sort, setFilter } = useSermonFilter();

  const hasActive = series !== null || preacher !== null || sort !== 'recent';

  const handleReset = () =>
    setFilter({ series: null, preacher: null, sort: null });

  const handleSeriesSelect = (value: string | null) =>
    setFilter({ series: value });

  const handlePreacherSelect = (value: string | null) =>
    setFilter({ preacher: value });

  const handleSortSelect = (value: SermonSortKey) =>
    setFilter({ sort: value === 'recent' ? null : value });

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="필터"
      footer={
        <Button fullWidth onClick={onClose}>
          결과 보기
        </Button>
      }
    >
      {hasActive && (
        <div className={styles.reset_row}>
          <button
            type="button"
            className={styles.reset_btn}
            onClick={handleReset}
          >
            초기화
          </button>
        </div>
      )}

      <section className={styles.section}>
        <h3 className={styles.section_title}>시리즈</h3>
        <ul role="list" className={styles.option_list}>
          <li>
            <FilterOption
              label="전체"
              selected={series === null}
              onClick={() => handleSeriesSelect(null)}
            />
          </li>
          <li>
            <FilterOption
              label="단독 설교"
              selected={series === 'none'}
              onClick={() => handleSeriesSelect('none')}
            />
          </li>
          {allSeries.map((item) => (
            <li key={item.id}>
              <FilterOption
                label={item.title}
                selected={series === item.slug}
                onClick={() => handleSeriesSelect(item.slug)}
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
              selected={preacher === null}
              onClick={() => handlePreacherSelect(null)}
            />
          </li>
          {allPreachers.map((item) => (
            <li key={item.id}>
              <FilterOption
                label={item.name}
                selected={preacher === item.name}
                onClick={() => handlePreacherSelect(item.name)}
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
              selected={sort === 'recent'}
              onClick={() => handleSortSelect('recent')}
            />
          </li>
          <li>
            <FilterOption
              label="오래된순"
              selected={sort === 'oldest'}
              onClick={() => handleSortSelect('oldest')}
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
