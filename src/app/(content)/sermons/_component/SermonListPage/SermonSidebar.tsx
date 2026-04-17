import Link from 'next/link';
import clsx from 'clsx';
import { buildSermonHref, getSeriesByYearEntries } from '@/utils/sermon';
import type { SearchParams } from '@/utils/search-params';
import type { SeriesWithSermonCount } from '@/types/sermon';
import styles from './SermonListPage.module.scss';

type Props = {
  allSeries: SeriesWithSermonCount[];
  totalCount: number;
  standaloneCount: number;
  activeSeries: string | null;
  params: SearchParams;
};

export default function SermonSidebar({
  allSeries,
  totalCount,
  standaloneCount,
  activeSeries,
  params
}: Props) {
  const seriesEntries = getSeriesByYearEntries(allSeries);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebar_inner}>
        <h2 id="sermon-sidebar-heading" className={styles.sidebar_heading}>
          시리즈
        </h2>
        <nav aria-labelledby="sermon-sidebar-heading">
          <ul role="list" className={styles.sidebar_list}>
            <li>
              <SidebarItem
                href={buildSermonHref(params, { series: null, preacher: null, q: null, year: null })}
                active={!activeSeries}
                label="전체"
                count={totalCount}
              />
            </li>
            <li>
              <SidebarItem
                href={buildSermonHref(params, { series: 'none' })}
                active={activeSeries === 'none'}
                label="단독 설교"
                count={standaloneCount}
              />
            </li>
            {seriesEntries.map(([yearKey, items]) => (
              <SidebarYearGroup
                key={yearKey}
                yearKey={yearKey}
                items={items}
                activeSeries={activeSeries}
                params={params}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}

function SidebarItem(props: { href: string; active: boolean; label: string; count: number }) {
  const { href, active, label, count } = props;

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={clsx(styles.sidebar_item, active && styles.sidebar_item_active)}
      scroll={false}
    >
      <span className={styles.sidebar_item_title}>{label}</span>
      <span className={styles.sidebar_badge}>{count}</span>
    </Link>
  );
}

function SidebarYearGroup({
  yearKey,
  items,
  activeSeries,
  params
}: {
  yearKey: string;
  items: SeriesWithSermonCount[];
  activeSeries: string | null;
  params: SearchParams;
}) {
  const yearHeadingId = `sermon-sidebar-year-${yearKey}`;
  return (
    <li className={styles.sidebar_group}>
      <h3 id={yearHeadingId} className={styles.sidebar_year}>
        {yearKey === '미분류' ? '미분류' : `${yearKey}년`}
      </h3>
      <ul role="list" aria-labelledby={yearHeadingId}>
        {items.map((item) => (
          <li key={item.id}>
            <SidebarItem
              href={buildSermonHref(params, { series: item.slug })}
              active={activeSeries === item.slug}
              label={item.title}
              count={item.sermon_count}
            />
          </li>
        ))}
      </ul>
    </li>
  );
}
