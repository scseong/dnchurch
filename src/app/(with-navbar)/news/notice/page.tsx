import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import NoticeTable from '@/app/(with-navbar)/news/notice/_component/NoticeTable';
import { getNotices } from '@/services/notice';
import { isNumeric } from '@/utils/validator';
import styles from './page.module.scss';

type Props = {
  searchParams: Promise<{ page: string }>;
};

export default async function Notice({ searchParams }: Props) {
  const params = await searchParams;
  const { page, isValid } = parseQueryParams(params);

  if (!isValid) notFound();

  const { data: posts, count } = await getNotices();

  if (!posts) {
    return (
      <MainContainer title="공지사항">
        <div>데이터를 가져오는 중입니다...</div>
      </MainContainer>
    );
  }

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

function parseQueryParams(params: { page?: string; year?: string }) {
  const isYearValid = isNumeric(params.year);
  const isPageValid = isNumeric(params.page);

  if (!isYearValid || !isPageValid) {
    return { isValid: false, year: undefined, page: 1 };
  }

  return {
    isValid: true,
    year: params.year ? parseInt(params.year) : undefined,
    page: Math.max(1, params.page ? parseInt(params.page) : 1)
  };
}
