import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import NoticeControlBar from '@/app/(content)/news/notices/_component/NoticeControlBar';
import NoticeList from '@/app/(content)/news/notices/_component/NoticeList';
import { Pagination } from '@/components/ui';
import { getNotices } from '@/services/notice';
import { validateSearchParams, validate } from '@/utils/common';
import {
  NOTICE_CATEGORIES,
  NOTICE_SORT_OPTIONS,
  DEFAULT_PAGE_SIZE,
  type NoticeSortOption
} from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '공지사항',
  description: '대구동남교회 공지사항을 확인하세요.'
};

type Props = {
  searchParams: Promise<{
    page: string;
    category: NoticeCategory;
    search: string;
    sort: NoticeSortOption;
  }>;
};

export default async function Notice({ searchParams }: Props) {
  const params = await searchParams;
  const isValid = validateSearchParams(params, {
    page: validate.number,
    category: validate.within(NOTICE_CATEGORIES),
    sort: validate.within(NOTICE_SORT_OPTIONS)
  });

  if (!isValid) notFound();

  const page = Math.max(1, params.page ? parseInt(params.page) : 1);
  const category = params.category ?? undefined;
  const search = params.search ?? undefined;
  const sort = params.sort ?? 'latest';

  const { data: posts, count } = await getNotices({ page, category, search, sort });

  return (
    <MainContainer title="공지사항">
      {/* Hero 제거로 사라진 페이지 제목 — 시각은 MobileHeader가 대신하고, 데스크톱·스크린리더용 h1을 둔다 */}
      <h1 className={styles.blind_title}>공지사항</h1>
      <div className={styles.wrap}>
        <NoticeControlBar
          count={Number(count)}
          currentCategory={category}
          currentSearch={search}
          currentSort={sort}
        />
        <NoticeList data={posts ?? []} />
        <Pagination
          totalCount={Number(count)}
          currentPage={page}
          pageSize={DEFAULT_PAGE_SIZE}
          maxVisiblePages={5}
        />
      </div>
    </MainContainer>
  );
}
