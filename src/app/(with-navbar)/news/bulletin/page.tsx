import Link from 'next/link';
import type { Metadata } from 'next';
import MainContainer from '@/app/_component/layout/common/MainContainer';
import { IoMdShare } from 'react-icons/io';
import BulletinTable from './_component/BulletinTable';
import BulletinYearFilter from './_component/BulletinYearFilter';
import KakaoShareBtn from '@/app/_component/common/KakaoShare';
import CreateBulletinButton from './_component/create/CreateBulletinButton';
import { getLatestBulletin, getQueryFunction } from '@/apis/bulletin';
import styles from './page.module.scss';
import { BulletinType } from '@/shared/types/types';

export const metadata: Metadata = {
  title: '주보 - 대구동남교회',
  description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.',
  openGraph: {
    title: '주보 - 대구동남교회',
    description: '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.'
  }
};

type BulletinProps = {
  searchParams: Promise<{ page: string; year: string }>;
};

export default async function Bulletin({ searchParams }: BulletinProps) {
  const { page, year } = await searchParams;

  const currentPage = page || '1';
  const [{ latestBulletin }, { bulletins, count }] = await Promise.all([
    getLatestBulletin(),
    getQueryFunction({ page: currentPage, year })
  ]);

  if (!latestBulletin || !bulletins) return <>Loading...</>;

  return (
    <MainContainer title="주보">
      <div className={styles.wrap}>
        <LatestBulletin latestBulletin={latestBulletin} />
        <BulletinTableSection
          year={year}
          bulletins={bulletins}
          count={count ?? 0}
          currentPage={currentPage}
        />
        <CreateBulletinButton />
      </div>
    </MainContainer>
  );
}

function LatestBulletin({ latestBulletin }: { latestBulletin: BulletinType }) {
  return (
    <section className={styles.latest_bulletin}>
      <div className={styles.notification}>
        <h4>이 주의 주보</h4>
        <p>{latestBulletin.title}</p>
      </div>
      <div className={styles.images_wrap}>
        {latestBulletin.image_url.map((url, idx) => (
          <Link href={url} target="_blank" key={idx}>
            <img src={url} alt={`${latestBulletin.title} - ${idx + 1}`} />
          </Link>
        ))}
      </div>
      <div className={styles.share}>
        <IoMdShare size="1.2rem" />
        <KakaoShareBtn title="주보 - 대구동남교회" description={latestBulletin?.title ?? ''} />
      </div>
    </section>
  );
}

function BulletinTableSection({
  year,
  bulletins,
  count,
  currentPage
}: {
  year: string;
  bulletins: BulletinType[];
  count: number;
  currentPage: string;
}) {
  return (
    <section className={styles.table}>
      <BulletinYearFilter currentYearParam={year} />
      <BulletinTable bulletins={bulletins} count={count ?? 0} currentPage={currentPage} />
    </section>
  );
}
