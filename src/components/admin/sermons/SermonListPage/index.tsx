'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { HiPlus } from 'react-icons/hi';
import PageHeader from '@/components/admin/layout/PageHeader';
import ConfirmModal from '@/components/admin/common/ConfirmModal';
import { SearchField } from '@/components/ui';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useToastStore } from '@/store/toast.store';
import { deleteSermonAction } from '@/actions/sermon.action';
import { getTotalPages } from '@/utils/pagination';
import type {
  AdminSermon,
  AdminSermonListParams,
  PreacherWithSermonCount,
  SeriesWithSermonCount,
  SermonStatusTab
} from '@/types/sermon';
import StatusTabs from './parts/StatusTabs';
import PreacherFilter from './parts/PreacherFilter';
import SeriesFilter from './parts/SeriesFilter';
import DateRangeFilter from './parts/DateRangeFilter';
import ActiveFilters from './parts/ActiveFilters';
import SermonTable from './parts/SermonTable';
import { useListFilters } from './hooks/useListFilters';
import { useSearchSync } from './hooks/useSearchSync';
import styles from './index.module.scss';

type DropdownKey = 'preacher' | 'series' | 'date';

interface SermonListPageProps {
  sermons: AdminSermon[];
  total: number;
  statusCounts: Record<SermonStatusTab, number>;
  initialParams: AdminSermonListParams;
  preachers: PreacherWithSermonCount[];
  series: SeriesWithSermonCount[];
}

export default function SermonListPage({
  sermons,
  total,
  statusCounts,
  initialParams,
  preachers,
  series
}: SermonListPageProps) {
  const router = useRouter();
  const filters = useListFilters(initialParams);
  const toast = useToastStore();
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSermon | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const {
    searchInput,
    setSearchInput,
    isSearchPending,
    clearSearch: handleSearchClear
  } = useSearchSync(filters.search, filters.setSearch);

  const toggleDropdown = (key: DropdownKey) =>
    setOpenDropdown((current) => (current === key ? null : key));

  const handleEdit = (sermon: AdminSermon) =>
    router.push(`/admin/sermons/${sermon.id}/edit`);

  const handleDeleteRequest = (sermon: AdminSermon) => setDeleteTarget(sermon);

  const handleDeleteConfirm = () => {
    if (!deleteTarget || isDeleting) return;
    const target = deleteTarget;
    startDeleteTransition(async () => {
      try {
        const result = await deleteSermonAction(target.id);
        if (result.success) {
          toast.success(result.message);
          setDeleteTarget(null);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        console.error('[delete sermon]', error);
        toast.error('삭제 중 오류가 발생했습니다');
      }
    });
  };

  useClickOutside({
    enabled: openDropdown !== null && isDesktop,
    selector: '[data-dropdown]',
    onClickOutside: () => setOpenDropdown(null)
  });

  const totalPages = getTotalPages(total, filters.pageSize);
  const safePage = Math.min(filters.page, totalPages);

  const hasActiveFilters = Boolean(
    filters.statusTab !== 'all' ||
      filters.search ||
      filters.selectedPreachers.length > 0 ||
      filters.selectedSeries.length > 0 ||
      filters.dateFrom ||
      filters.dateTo
  );

  // 검색 타이머·draft까지 함께 정리 — clearAll만 호출하면 search prop이 ''→''로 안 바뀌어
  // 대기 중인 디바운스 타이머가 살아남아 방금 초기화한 필터를 검색 상태로 되돌린다 (PR #114 Codex 리뷰)
  const handleClearAll = () => {
    handleSearchClear();
    filters.clearAll();
  };

  const handleClearFilters = () => {
    filters.setStatusTab('all');
    handleClearAll();
  };

  const handleCreateNew = () => router.push('/admin/sermons/new');

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
          <SearchField
            className={styles.search_box}
            value={searchInput}
            onChange={setSearchInput}
            onClear={handleSearchClear}
            loading={isSearchPending}
            placeholder="제목, 성경 구절, 설교자로 검색"
            aria-label="설교 검색"
          />
          <PreacherFilter
            preachers={preachers}
            selected={filters.selectedPreachers}
            onToggle={filters.togglePreacher}
            isOpen={openDropdown === 'preacher'}
            onToggleOpen={() => toggleDropdown('preacher')}
          />
          <SeriesFilter
            series={series}
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
          preachersData={preachers}
          seriesData={series}
          onRemovePreacher={filters.togglePreacher}
          onRemoveSeries={filters.toggleSeries}
          onClearSearch={handleSearchClear}
          onClearDate={filters.clearDate}
          onClearAll={handleClearAll}
        />
        <SermonTable
          sermons={sermons}
          sort={filters.sort}
          onSortChange={filters.handleSortChange}
          total={total}
          currentPage={safePage}
          pageSize={filters.pageSize}
          onPageChange={filters.setPage}
          onPageSizeChange={filters.setPageSize}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={handleClearFilters}
          onCreateNew={handleCreateNew}
          isLoading={filters.isPending}
        />
      </div>
      <ConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="설교 삭제"
        description={
          deleteTarget
            ? `"${deleteTarget.title}"을(를) 삭제하시겠습니까?\n연결된 첨부 자료도 함께 삭제됩니다.`
            : ''
        }
        confirmLabel="삭제"
        loadingLabel="삭제 중..."
        danger
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
