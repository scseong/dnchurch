import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import LatestBulletin from '@/app/(with-navbar)/news/bulletin/_component/LatestBulletin';
import BulletinTableSection from '@/app/(with-navbar)/news/bulletin/_component/BulletinTableSection';
import { getBulletinSummary } from '@/services/bulletin';
import { validateSearchParams, validate } from '@/utils/common';
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
  const isValid = validateSearchParams(params, {
    year: validate.number,
    page: validate.number
  });

  if (!isValid) notFound();

  const page = Math.max(1, params.page ? parseInt(params.page) : 1);
  const year = params.year ? parseInt(params.year) : undefined;

  const { data, error } = await getBulletinSummary({ year, page });

  if (error || !data) return <div>데이터를 불러올 수 없습니다.</div>;

  const { items: bulletins, latest: latestBulletin, years, total } = data;

  return (
    <MainContainer title="주보">
      <div className={styles.wrap}>
        <LatestBulletin
          title={latestBulletin?.title ?? ''}
          images={latestBulletin?.bulletin_images ?? []}
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
