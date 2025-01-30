import BulletinTable from './_component/BulletinTable';
import Link from 'next/link';
import type { Metadata } from 'next';
import { IoMdShare } from 'react-icons/io';
import KakaoShareBtn from '@/app/_component/common/KakaoShare';
import { getLatestBulletin, getQueryFunction } from '@/actions/bulletin/bulletin.action';
import styles from './page.module.scss';
import BulletinYearFilter from './_component/BulletinYearFilter';
import CreateBulletinButton from './create/_component/CreateBulletinButton';

export const metadata: Metadata = {
  title: '주보 - 대구동남교회',
  description: '이번 주 교회 주보에서 예배 일정과 소식을 읽어보세요.'
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

  // TODO: 조건부 렌더링
  if (!latestBulletin) return <div>...Loading</div>;
  if (!bulletins) return <div>...Loading</div>;

  return (
    <section className={styles.bulletin}>
      <h2>주보</h2>
      <div className={styles.wrap}>
        <section className={styles.latest_bulletin}>
          <div className={styles.notification}>
            <h3>이 주의 주보</h3>
            <p>{latestBulletin.title}</p>
          </div>
          <div className={styles.images_wrap}>
            {latestBulletin.image_url.map((url, idx) => (
              <Link href={url} target="_blank" key={idx}>
                <img src={url} alt={`${latestBulletin.title} - ${idx + 1}`} />
              </Link>
            ))}
            {!latestBulletin && (
              // TODO: API 호출 실패 시 UI
              <Link href="#">
                <img src="" />
              </Link>
            )}
          </div>
          <div className={styles.share}>
            <IoMdShare size="1.2rem" />
            <KakaoShareBtn title="주보 - 대구동남교회" description={latestBulletin?.title ?? ''} />
          </div>
        </section>
        <section className={styles.table}>
          <BulletinYearFilter currentYearParam={year} />
          <BulletinTable bulletins={bulletins} count={count ?? 0} currentPage={currentPage} />
          <CreateBulletinButton />
        </section>
      </div>
    </section>
  );
}
