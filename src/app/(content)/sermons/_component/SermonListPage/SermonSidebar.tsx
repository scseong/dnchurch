import Link from 'next/link';
import clsx from 'clsx';
import { ListItem } from '@/components/ui';
import SermonSearchForm from './SermonSearchForm';
import { buildSermonHref, formatPreacherLabel } from '@/utils/sermon';
import type { SearchParams } from '@/utils/search-params';
import type { PreacherWithSermonCount, SeriesWithSermonCount } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  allPreachers: PreacherWithSermonCount[];
  totalCount: number;
  standaloneCount: number;
  activeSeries: string | null;
  activePreacher: string | null;
  hasActiveFilter: boolean;
  params: SearchParams;
};

export default function SermonSidebar({
  allSeries,
  allPreachers,
  totalCount,
  standaloneCount,
  activeSeries,
  activePreacher,
  hasActiveFilter,
  params
}: Props) {
  // 필터 변경·초기화 시 정렬도 초기화 — useSermonFilter.setFilter와 동일한 D2 cascade.
  // (buildSermonHref 전역 주입은 page.tsx out-of-range redirect의 sort까지 날리므로 call-site에서 명시)
  const resetHref = buildSermonHref(params, {
    series: null,
    preacher: null,
    q: null,
    year: null,
    sort: null
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

        <SermonSearchForm />

        <section
          aria-labelledby="sidebar-series-heading"
          className={styles.sidebar_section}
        >
          <h3 id="sidebar-series-heading" className={styles.section_label}>
            시리즈
          </h3>
          <nav aria-label="시리즈 필터">
            <ul role="list" className={styles.option_list}>
              <li>
                <FilterItem
                  href={buildSermonHref(params, { series: null, sort: null })}
                  active={!activeSeries}
                  label="전체"
                  count={totalCount}
                />
              </li>
              <li>
                <FilterItem
                  href={buildSermonHref(params, { series: 'none', sort: null })}
                  active={activeSeries === 'none'}
                  label="단독 설교"
                  count={standaloneCount}
                />
              </li>
              {allSeries.map((item) => (
                <li key={item.id}>
                  <FilterItem
                    href={buildSermonHref(params, { series: item.slug, sort: null })}
                    active={activeSeries === item.slug}
                    label={item.title}
                    count={item.sermon_count}
                  />
                </li>
              ))}
            </ul>
          </nav>
        </section>

        <section
          aria-labelledby="sidebar-preacher-heading"
          className={styles.sidebar_section}
        >
          <h3 id="sidebar-preacher-heading" className={styles.section_label}>
            설교자
          </h3>
          <nav aria-label="설교자 필터">
            <ul role="list" className={styles.option_list}>
              <li>
                <FilterItem
                  href={buildSermonHref(params, { preacher: null, sort: null })}
                  active={!activePreacher}
                  label="전체"
                  count={totalCount}
                />
              </li>
              {allPreachers.map((preacher) => (
                <li key={preacher.id}>
                  <FilterItem
                    href={buildSermonHref(params, { preacher: preacher.name, sort: null })}
                    active={activePreacher === preacher.name}
                    label={formatPreacherLabel(preacher)}
                    count={preacher.sermon_count}
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
