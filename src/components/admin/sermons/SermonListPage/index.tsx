'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import PageHeader from '@/components/admin/layout/PageHeader';
import { useClickOutside } from '@/hooks/useClickOutside';
import { MOCK_ADMIN_SERMONS, type SermonStatusTab } from '@/lib/mocks/sermons-admin';
import {
  countByStatus,
  filterSermons,
  sortSermons,
  type SermonSortKey,
  type SermonSortState
} from '@/lib/utils/sermon-filter';
import StatusTabs from './parts/StatusTabs';
import SearchBox from './parts/SearchBox';
import PreacherFilter from './parts/PreacherFilter';
import SeriesFilter from './parts/SeriesFilter';
import DateRangeFilter from './parts/DateRangeFilter';
import ActiveFilters from './parts/ActiveFilters';
import SermonTable from './parts/SermonTable';
import { MOCK_PREACHERS, MOCK_SERIES } from './parts/mockData';
import styles from './index.module.scss';

type DropdownKey = 'preacher' | 'series' | 'date';

export default function SermonListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState<SermonStatusTab>('all');
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [selectedPreachers, setSelectedPreachers] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState<SermonSortState | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const resetPage = () => setPage(1);

  const toggleDropdown = (key: DropdownKey) =>
    setOpenDropdown((current) => (current === key ? null : key));

  const togglePreacher = (id: string) => {
    setSelectedPreachers((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    resetPage();
  };

  const toggleSeries = (id: string) => {
    setSelectedSeries((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
    resetPage();
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handleStatusChange = (value: SermonStatusTab) => {
    setStatusTab(value);
    resetPage();
  };

  const handleDateChange = ({ from, to }: { from: string; to: string }) => {
    setDateFrom(from);
    setDateTo(to);
    resetPage();
  };

  const clearDate = () => {
    setDateFrom('');
    setDateTo('');
    resetPage();
  };

  const clearAll = () => {
    setSearch('');
    setSelectedPreachers([]);
    setSelectedSeries([]);
    setDateFrom('');
    setDateTo('');
    resetPage();
  };

  const handleSortChange = (key: SermonSortKey) => {
    setSort((current) => {
      if (current?.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  useClickOutside({
    enabled: openDropdown !== null,
    selector: '[data-dropdown]',
    onClickOutside: () => setOpenDropdown(null)
  });

  const filtered = useMemo(
    () =>
      sortSermons(
        filterSermons(MOCK_ADMIN_SERMONS, {
          statusTab,
          search,
          selectedPreachers,
          selectedSeries,
          dateFrom,
          dateTo
        }),
        sort
      ),
    [statusTab, search, selectedPreachers, selectedSeries, dateFrom, dateTo, sort]
  );

  const statusCounts = useMemo(() => countByStatus(MOCK_ADMIN_SERMONS), []);

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize]
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
          activeStatus={statusTab}
          counts={statusCounts}
          onChange={handleStatusChange}
        />
        <div className={styles.toolbar}>
          <SearchBox
            value={search}
            onChange={handleSearchChange}
            onClear={() => handleSearchChange('')}
          />
          <PreacherFilter
            preachers={MOCK_PREACHERS}
            selected={selectedPreachers}
            onToggle={togglePreacher}
            isOpen={openDropdown === 'preacher'}
            onToggleOpen={() => toggleDropdown('preacher')}
          />
          <SeriesFilter
            series={MOCK_SERIES}
            selected={selectedSeries}
            onToggle={toggleSeries}
            isOpen={openDropdown === 'series'}
            onToggleOpen={() => toggleDropdown('series')}
          />
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onChange={handleDateChange}
            isOpen={openDropdown === 'date'}
            onToggleOpen={() => toggleDropdown('date')}
          />
        </div>
        <ActiveFilters
          search={search}
          preachers={selectedPreachers}
          series={selectedSeries}
          dateFrom={dateFrom}
          dateTo={dateTo}
          preachersData={MOCK_PREACHERS}
          seriesData={MOCK_SERIES}
          onRemovePreacher={togglePreacher}
          onRemoveSeries={toggleSeries}
          onClearSearch={() => handleSearchChange('')}
          onClearDate={clearDate}
          onClearAll={clearAll}
        />
        <SermonTable
          sermons={paginated}
          sort={sort}
          onSortChange={handleSortChange}
          total={total}
          currentPage={safePage}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
        />
      </div>
    </>
  );
}
