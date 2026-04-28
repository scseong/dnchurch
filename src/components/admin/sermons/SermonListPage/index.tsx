'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import PageHeader from '@/components/admin/layout/PageHeader';
import { useClickOutside } from '@/hooks/useClickOutside';
import StatusTabs, { type SermonStatus } from './parts/StatusTabs';
import SearchBox from './parts/SearchBox';
import PreacherFilter from './parts/PreacherFilter';
import SeriesFilter from './parts/SeriesFilter';
import DateRangeFilter from './parts/DateRangeFilter';
import ActiveFilters from './parts/ActiveFilters';
import { MOCK_PREACHERS, MOCK_SERIES } from './parts/mockData';
import styles from './index.module.scss';

type DropdownKey = 'preacher' | 'series' | 'date';

export default function SermonListPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [selectedPreachers, setSelectedPreachers] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const toggleDropdown = (key: DropdownKey) =>
    setOpenDropdown((current) => (current === key ? null : key));

  const togglePreacher = (id: string) =>
    setSelectedPreachers((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );

  const toggleSeries = (id: string) =>
    setSelectedSeries((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );

  const clearDate = () => {
    setDateFrom('');
    setDateTo('');
  };

  const clearAll = () => {
    setSearch('');
    setSelectedPreachers([]);
    setSelectedSeries([]);
    clearDate();
  };

  useClickOutside({
    enabled: openDropdown !== null,
    selector: '[data-dropdown]',
    onClickOutside: () => setOpenDropdown(null)
  });

  const activeStatus: SermonStatus = 'all';
  const counts: Record<SermonStatus, number> = {
    all: 42,
    published: 38,
    draft: 3,
    scheduled: 1
  };

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
        <StatusTabs activeStatus={activeStatus} counts={counts} onChange={() => {}} />
        <div className={styles.toolbar}>
          <SearchBox value={search} onChange={setSearch} onClear={() => setSearch('')} />
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
            onChange={({ from, to }) => {
              setDateFrom(from);
              setDateTo(to);
            }}
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
          onClearSearch={() => setSearch('')}
          onClearDate={clearDate}
          onClearAll={clearAll}
        />
        <p className={styles.placeholder}>설교 목록 테이블이 여기에 들어갑니다</p>
      </div>
    </>
  );
}
