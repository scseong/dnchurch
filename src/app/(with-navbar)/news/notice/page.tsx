import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import NoticeTable from '@/app/(with-navbar)/news/notice/_component/NoticeTable';
import { getNotices } from '@/services/notice';
import { validateSearchParams, validate } from '@/utils/common';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './page.module.scss';

type Props = {
  searchParams: Promise<{ page: string; category: NoticeCategory }>;
};

export default async function Notice({ searchParams }: Props) {
  const params = await searchParams;
  const isValid = validateSearchParams(params, {
    page: validate.number,
    category: validate.within(NOTICE_CATEGORIES)
  });

  if (!isValid) notFound();

  const page = params.page ? parseInt(params.page) : 1;
  const category = params.category ?? undefined;

  const { data: posts, count } = await getNotices({ page, category });

  return (
    <MainContainer title="공지사항">
      <div className={styles.wrap}>
        {/* TODO: 검색 */}
        <div>검색</div>
        {/* <NoticeTable data={posts} total={Number(count)} currentPage={page} /> */}
      </div>
    </MainContainer>
  );
}
