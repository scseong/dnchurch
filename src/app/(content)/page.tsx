import type { Metadata } from 'next';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import {
  Banner,
  TodayVerse,
  QuickAccess,
  WeeklyBulletin,
  RecentSermons,
  NewHere,
  PhotoGallery,
  LoginPrompt,
  ChurchJsonLd
} from '../_component/home';
import styles from './page.module.scss';

// canonical은 홈에서만 선언한다. root layout에 두면 하위 페이지가 canonical=홈으로 상속받아 중복 페이지로 오선언된다.
// openGraph는 공유 상수 전체를 펼친 뒤 url만 더한다 — Next.js는 shallow merge라 부분 선언 시 og:image 등이 사라진다.
// url은 설교 페이지와 같은 절대 URL 방식. 상대 '/'는 페이지 레벨에서 og:url로 emit되지 않고, env 미설정 시 undefined라 og:url이 안전하게 생략된다.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...OPEN_GRAPH_BASE, url: process.env.NEXT_PUBLIC_SITE_URL }
};

// 홈은 모든 데이터가 createStaticClient(캐시)라 정적 프리렌더된다 — async 섹션은 빌드 시점에 해소되므로
// Suspense/skeleton 폴백은 사용자에게 노출되지 않는다(죽은 코드). 섹션을 직접 렌더한다.
export default async function Home() {
  return (
    <div className={styles.home}>
      <h1 className={styles.blind}>대구동남교회</h1>
      <ChurchJsonLd />
      <Banner />
      <TodayVerse />
      <QuickAccess />
      <WeeklyBulletin />
      <NewHere />
      <PhotoGallery />
      <RecentSermons />
      <LoginPrompt />
    </div>
  );
}
