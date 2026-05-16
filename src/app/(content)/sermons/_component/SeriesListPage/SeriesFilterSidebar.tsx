import Link from 'next/link';
import clsx from 'clsx';
import { ListItem } from '@/components/ui';
import SeriesSearchForm from './SeriesSearchForm';
import {
  buildSeriesHref,
  filterSeries,
  getSeriesYearOptions,
  type SeriesStatusFilter
} from '@/utils/sermon';
import type { SearchParams } from '@/utils/search-params';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SeriesListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  status?: SeriesStatusFilter;
  year?: number;
  q?: string;
  hasActiveFilter: boolean;
  params: SearchParams;
};

const STATUS_OPTIONS: { value: SeriesStatusFilter | null; label: string }[] = [
  { value: null, label: '전체' },
  { value: 'active', label: '진행 중' },
  { value: 'ended', label: '완료' }
];

export default function SeriesFilterSidebar({
  allSeries,
  status,
  year,
  q,
  hasActiveFilter,
  params
}: Props) {
  const yearOptions = getSeriesYearOptions(allSeries);
  const resetHref = buildSeriesHref(params, {
    status: null,
    year: null,
    q: null
  });

  return (
    <aside className={styles.sidebar}>
      <div className={clsx(styles.sidebar_inner, styles.sidebar_card)}>
        <header className={styles.sidebar_header}>
          <h2 className={styles.sidebar_title}>필터</h2>
          {hasActiveFilter && (
            <Link href={resetHref} className={styles.sidebar_reset} scroll={false}>
              초기화
            </Link>
          )}
        </header>

        <SeriesSearchForm />

        <section
          aria-labelledby="series-status-heading"
          className={styles.sidebar_section}
        >
          <h3 id="series-status-heading" className={styles.section_label}>
            상태
          </h3>
          <nav aria-label="상태 필터">
            <ul role="list" className={styles.option_list}>
              {STATUS_OPTIONS.map((option) => (
                <li key={option.label}>
                  <FilterItem
                    href={buildSeriesHref(params, { status: option.value })}
                    active={(status ?? null) === option.value}
                    label={option.label}
                    count={
                      filterSeries(allSeries, {
                        status: option.value ?? undefined,
                        year,
                        q
                      }).length
                    }
                  />
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section
          aria-labelledby="series-year-heading"
          className={styles.sidebar_section}
        >
          <h3 id="series-year-heading" className={styles.section_label}>
            연도
          </h3>
          <nav aria-label="연도 필터">
            <ul role="list" className={styles.option_list}>
              <li>
                <FilterItem
                  href={buildSeriesHref(params, { year: null })}
                  active={year === undefined}
                  label="전체"
                  count={filterSeries(allSeries, { status, q }).length}
                />
              </li>
              {yearOptions.map((option) => (
                <li key={option}>
                  <FilterItem
                    href={buildSeriesHref(params, { year: String(option) })}
                    active={year === option}
                    label={`${option}년`}
                    count={
                      filterSeries(allSeries, {
                        status,
                        year: option,
                        q
                      }).length
                    }
                  />
                </li>
              ))}
            </ul>
          </nav>
        </section>
      </div>
    </aside>
  );
}

function FilterItem({
  href,
  active,
  label,
  count
}: {
  href: string;
  active: boolean;
  label: string;
  count: number;
}) {
  return (
    <ListItem
      href={href}
      selected={active}
      scroll={false}
      className={clsx(styles.option, active && styles.option_active)}
      trailing={<span className={styles.option_count}>{count}</span>}
    >
      <span
        className={clsx(styles.radio, active && styles.radio_active)}
        aria-hidden="true"
      >
        {active && <span className={styles.radio_dot} />}
      </span>
      <span className={styles.option_label}>{label}</span>
    </ListItem>
  );
}
