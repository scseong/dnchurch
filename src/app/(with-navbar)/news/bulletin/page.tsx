import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import LatestBulletin from '@/app/(with-navbar)/news/bulletin/_component/LatestBulletin';
import BulletinTableSection from '@/app/(with-navbar)/news/bulletin/_component/BulletinTableSection';
import { fetchBulletinSummaryRpc } from '@/services/bulletin';
import { isNumeric } from '@/utils/validator';
import styles from './page.module.scss';

type Props = {
  searchParams: Promise<{ page: string; year: string }>;
};

export const metadata: Metadata = {
  title: '주보',
  description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.',
  openGraph: {
    title: '주보',
    description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.'
  }
};

export default async function BulletinPage({ searchParams }: Props) {
  const params = await searchParams;
  const { year, page, isValid } = parseQueryParams(params);

  if (!isValid) notFound();

  const { data, error } = await fetchBulletinSummaryRpc({ year, page });

  if (error || !data) return <div>데이터를 불러올 수 없습니다.</div>;

  const { items: bulletins, latest: latestBulletin, years, total } = data;

  return (
    <MainContainer title="주보">
      <div className={styles.wrap}>
        <LatestBulletin
          title={latestBulletin?.title ?? ''}
          image_url={latestBulletin?.image_url ?? []}
        />
        <BulletinTableSection
          yearFilter={year}
          years={years}
          bulletins={bulletins ?? []}
          total={total}
          currentPage={page}
        />
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
