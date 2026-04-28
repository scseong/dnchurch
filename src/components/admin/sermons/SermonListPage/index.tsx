'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import PageHeader from '@/components/admin/layout/PageHeader';
import { useClickOutside } from '@/hooks/useClickOutside';
import { MOCK_ADMIN_SERMONS } from '@/lib/mocks/sermons-admin';
import {
  countByStatus,
  filterSermons,
  sortSermons
} from '@/lib/utils/sermon-filter';
import StatusTabs from './parts/StatusTabs';
import SearchBox from './parts/SearchBox';
import PreacherFilter from './parts/PreacherFilter';
import SeriesFilter from './parts/SeriesFilter';
import DateRangeFilter from './parts/DateRangeFilter';
import ActiveFilters from './parts/ActiveFilters';
import SermonTable from './parts/SermonTable';
import { MOCK_PREACHERS, MOCK_SERIES } from './parts/mockData';
import { useListFilters } from './hooks/useListFilters';
import styles from './index.module.scss';

type DropdownKey = 'preacher' | 'series' | 'date';

export default function SermonListPage() {
  const router = useRouter();
  const filters = useListFilters();
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const toggleDropdown = (key: DropdownKey) =>
    setOpenDropdown((current) => (current === key ? null : key));

  useClickOutside({
    enabled: openDropdown !== null,
    selector: '[data-dropdown]',
    onClickOutside: () => setOpenDropdown(null)
  });

  const filtered = useMemo(
    () =>
      sortSermons(
        filterSermons(MOCK_ADMIN_SERMONS, {
          statusTab: filters.statusTab,
          search: filters.search,
          selectedPreachers: filters.selectedPreachers,
          selectedSeries: filters.selectedSeries,
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo
        }),
        filters.sort
      ),
    [
      filters.statusTab,
      filters.search,
      filters.selectedPreachers,
      filters.selectedSeries,
      filters.dateFrom,
      filters.dateTo,
      filters.sort
    ]
  );

  const statusCounts = useMemo(() => countByStatus(MOCK_ADMIN_SERMONS), []);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const safePage = Math.min(filters.page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * filters.pageSize, safePage * filters.pageSize),
    [filtered, safePage, filters.pageSize]
  );

  return (
    <>
      <PageHeader
        eyebrow="설교"
        title="설교 관리"
        description="등록된 설교를 검색하고 발행 상태를 관리합니다"
        actions={[
          {
            label: '새 설교 등록',
            variant: 'pri',
            icon: <HiPlus />,
            onClick: () => router.push('/admin/sermons/new')
          }
        ]}
      />
      <div className={styles.wrapper}>
        <StatusTabs
          activeStatus={filters.statusTab}
          counts={statusCounts}
          onChange={filters.setStatusTab}
        />
        <div className={styles.toolbar}>
          <SearchBox
            value={filters.search}
            onChange={filters.setSearch}
            onClear={() => filters.setSearch('')}
          />
          <PreacherFilter
            preachers={MOCK_PREACHERS}
            selected={filters.selectedPreachers}
            onToggle={filters.togglePreacher}
            isOpen={openDropdown === 'preacher'}
            onToggleOpen={() => toggleDropdown('preacher')}
          />
          <SeriesFilter
            series={MOCK_SERIES}
            selected={filters.selectedSeries}
            onToggle={filters.toggleSeries}
            isOpen={openDropdown === 'series'}
            onToggleOpen={() => toggleDropdown('series')}
          />
          <DateRangeFilter
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onChange={filters.setDateRange}
            isOpen={openDropdown === 'date'}
            onToggleOpen={() => toggleDropdown('date')}
          />
        </div>
        <ActiveFilters
          search={filters.search}
          preachers={filters.selectedPreachers}
          series={filters.selectedSeries}
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          preachersData={MOCK_PREACHERS}
          seriesData={MOCK_SERIES}
          onRemovePreacher={filters.togglePreacher}
          onRemoveSeries={filters.toggleSeries}
          onClearSearch={() => filters.setSearch('')}
          onClearDate={filters.clearDate}
          onClearAll={filters.clearAll}
        />
        <SermonTable
          sermons={paginated}
          sort={filters.sort}
          onSortChange={filters.handleSortChange}
          total={total}
          currentPage={safePage}
          pageSize={filters.pageSize}
          onPageChange={filters.setPage}
          onPageSizeChange={filters.setPageSize}
        />
      </div>
    </>
  );
}
