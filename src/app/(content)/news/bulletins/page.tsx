import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MainContainer from '@/components/layout/container/MainContainer';
import FeaturedBulletin from '@/app/(content)/news/bulletins/_component/FeaturedBulletin';
import BulletinArchive from '@/app/(content)/news/bulletins/_component/BulletinArchive';
import { getBulletinSummary } from '@/services/bulletin';
import { validateSearchParams, validate } from '@/utils/common';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import styles from './page.module.scss';

type Props = {
  searchParams: Promise<{ page: string; year: string; month: string }>;
};

export const metadata: Metadata = {
  title: '주보',
  description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.',
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '주보',
    description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.'
  }
};

export default async function BulletinPage({ searchParams }: Props) {
  const params = await searchParams;
  const isValid = validateSearchParams(params, {
    year: validate.number,
    month: validate.number,
    page: validate.number
  });

  if (!isValid) notFound();

  const page = Math.max(1, params.page ? parseInt(params.page) : 1);
  const year = params.year ? parseInt(params.year) : undefined;
  const month = params.month ? parseInt(params.month) : undefined;

  // month는 반드시 year와 함께 온다(월별 보기 피커가 둘 다 설정). 단독 month는 featured 중복을 부르므로 막는다.
  if (month !== undefined && (year === undefined || month < 1 || month > 12)) notFound();

  const { data, error } = await getBulletinSummary({ year, month, page });

  if (error || !data) return <div>데이터를 불러올 수 없습니다.</div>;

  const { items, latest, years, monthBuckets, total } = data;
  const hasFilter = Boolean(year);

  return (
    <MainContainer title="주보">
      {/* Hero 제거로 사라진 페이지 제목 — 시각은 MobileHeader가 대신하고, 데스크톱·스크린리더용 h1을 둔다 */}
      <h1 className={styles.blind_title}>주보</h1>
      <div className={styles.wrap}>
        {!hasFilter && <FeaturedBulletin bulletin={latest} />}
        <BulletinArchive
          items={items}
          total={total}
          currentPage={page}
          year={year}
          month={month}
          years={years}
          monthBuckets={monthBuckets}
        />
      </div>
    </MainContainer>
  );
}
