import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import NoticeControlBar from '@/app/(content)/news/notices/_component/NoticeControlBar';
import NoticeDrawerProvider from '@/app/(content)/news/notices/_component/NoticeDrawerProvider';
import NoticeTable from '@/app/(content)/news/notices/_component/NoticeTable';
import { Pagination } from '@/components/ui';
import { getNotices } from '@/services/notice';
import { validateSearchParams, validate } from '@/utils/common';
import { NOTICE_CATEGORIES, DEFAULT_PAGE_SIZE } from '@/constants/notice';
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
  }>;
};

export default async function Notice({ searchParams }: Props) {
  const params = await searchParams;
  const isValid = validateSearchParams(params, {
    page: validate.number,
    category: validate.within(NOTICE_CATEGORIES)
  });

  if (!isValid) notFound();

  const page = Math.max(1, params.page ? parseInt(params.page) : 1);
  const category = params.category ?? undefined;
  const search = params.search ?? undefined;

  const { data: posts, count } = await getNotices({ page, category, search });

  // drawer에는 읽는 필드만 내려 RSC payload에 전체 row가 중복 직렬화되지 않게 한다
  const drawerItems = (posts ?? []).map(
    ({ id, title, category: noticeCategory, content, created_at, view_count, attachment_url }) => ({
      id,
      title,
      category: noticeCategory,
      content,
      created_at,
      view_count,
      attachment_url
    })
  );

  return (
    <MainContainer title="공지사항">
      <div className={styles.wrap}>
        <NoticeControlBar total={Number(count)} currentCategory={category} currentSearch={search} />
        <NoticeDrawerProvider notices={drawerItems}>
          <NoticeTable data={posts ?? []} total={Number(count)} currentPage={page} />
          <Pagination
            totalCount={Number(count)}
            currentPage={page}
            pageSize={DEFAULT_PAGE_SIZE}
            maxVisiblePages={5}
          />
        </NoticeDrawerProvider>
      </div>
    </MainContainer>
  );
}
