import type { Metadata } from 'next';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import LatestBulletin from '@/app/(with-navbar)/news/bulletin/_component/LastBulletin';
import BulletinTableSection from '@/app/(with-navbar)/news/bulletin/_component/BulletinTableSection';
import { getServerService } from '@/services';
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

export const revalidate = 86400; // 24 hours

export default async function BulletinPage({ searchParams }: Props) {
  const params = await searchParams;
  const yearFilter = params.year ? parseInt(params.year) : undefined;
  const page = params.page ? parseInt(params.page) : 1;

  const api = await getServerService({
    tags: ['bulletins'],
    revalidate: 86400
  });

  const { data, error } = await api.bulletin.getBulletinSummary({
    year: yearFilter,
    page
  });

  if (error || !data) return <div>데이터를 불러올 수 없습니다.</div>;

  const { items: bulletins, latest: latestBulletin, years, total } = data;

  return (
    <MainContainer title="주보">
      <div className={styles.wrap}>
        <LatestBulletin latestBulletin={latestBulletin} />
        <BulletinTableSection
          yearFilter={yearFilter}
          years={years}
          bulletins={bulletins}
          total={total}
          currentPage={page}
        />
      </div>
    </MainContainer>
  );
}
