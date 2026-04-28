'use client';

import { HiX } from 'react-icons/hi';
import { NONE_SERIES_ID, type MockPreacher, type MockSeries } from './mockData';
import styles from '../index.module.scss';

interface ActiveFiltersProps {
  search: string;
  preachers: string[];
  series: string[];
  dateFrom: string;
  dateTo: string;
  preachersData: MockPreacher[];
  seriesData: MockSeries[];
  onRemovePreacher: (id: string) => void;
  onRemoveSeries: (id: string) => void;
  onClearSearch: () => void;
  onClearDate: () => void;
  onClearAll: () => void;
}

export default function ActiveFilters({
  search,
  preachers,
  series,
  dateFrom,
  dateTo,
  preachersData,
  seriesData,
  onRemovePreacher,
  onRemoveSeries,
  onClearSearch,
  onClearDate,
  onClearAll
}: ActiveFiltersProps) {
  const hasAny = Boolean(
    search || preachers.length > 0 || series.length > 0 || dateFrom || dateTo
  );
  if (!hasAny) return null;

  const preacherName = (id: string) =>
    preachersData.find((preacher) => preacher.id === id)?.name ?? id;
  const seriesTitle = (id: string) => {
    if (id === NONE_SERIES_ID) return '단독 설교';
    return seriesData.find((entry) => entry.id === id)?.title ?? id;
  };

  const dateLabel = () => {
    if (dateFrom && dateTo) return `${dateFrom} ~ ${dateTo}`;
    if (dateFrom) return `${dateFrom} ~`;
    return `~ ${dateTo}`;
  };

  return (
    <div className={styles.active_filters}>
      <span className={styles.active_label}>적용된 필터</span>
      <ul className={styles.pill_list}>
        {search && (
          <li className={styles.pill}>
            검색: {search}
            <button
              type="button"
              className={styles.pill_remove}
              onClick={onClearSearch}
              aria-label="검색어 필터 제거"
            >
              <HiX aria-hidden />
            </button>
          </li>
        )}

        {preachers.map((id) => (
          <li key={`preacher-${id}`} className={styles.pill}>
            설교자: {preacherName(id)}
            <button
              type="button"
              className={styles.pill_remove}
              onClick={() => onRemovePreacher(id)}
              aria-label={`설교자 필터 ${preacherName(id)} 제거`}
            >
              <HiX aria-hidden />
            </button>
          </li>
        ))}

        {series.map((id) => (
          <li key={`series-${id}`} className={styles.pill}>
            시리즈: {seriesTitle(id)}
            <button
              type="button"
              className={styles.pill_remove}
              onClick={() => onRemoveSeries(id)}
              aria-label={`시리즈 필터 ${seriesTitle(id)} 제거`}
            >
              <HiX aria-hidden />
            </button>
          </li>
        ))}

        {(dateFrom || dateTo) && (
          <li className={styles.pill}>
            기간: {dateLabel()}
            <button
              type="button"
              className={styles.pill_remove}
              onClick={onClearDate}
              aria-label="기간 필터 제거"
            >
              <HiX aria-hidden />
            </button>
          </li>
        )}
      </ul>
      <button type="button" className={styles.clear_all} onClick={onClearAll}>
        모두 지우기
      </button>
    </div>
  );
}
