import type { Metadata } from 'next';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import LatestBulletin from '@/app/(with-navbar)/news/bulletin/_component/LastBulletin';
import BulletinTableSection from '@/app/(with-navbar)/news/bulletin/_component/BulletinTableSection';
import { getBulletinSummary } from '@/apis/bulletin';
import { getCurrentYear } from '@/shared/util/date';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '주보 - 대구동남교회',
  description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.',
  openGraph: {
    title: '주보 - 대구동남교회',
    description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.'
  }
};

type Props = {
  searchParams: Promise<{ page: string; year: string }>;
};

export default async function BulletinPage({ searchParams }: Props) {
  const params = await searchParams;
  const yearFilter = params.year ? parseInt(params.year) : getCurrentYear();
  const page = params.page ? parseInt(params.page) : 1;
  const {
    items: bulletins,
    latest: latestBulletin,
    years,
    total
  } = await getBulletinSummary({ year: yearFilter, page });

  return (
    <MainContainer title="주보">
      <div className={styles.wrap}>
        <LatestBulletin latestBulletin={latestBulletin} />
        <BulletinTableSection
          yearFilter={yearFilter}
          years={years}
          bulletins={bulletins}
          count={total}
          currentPage={page}
        />
      </div>
    </MainContainer>
  );
}
