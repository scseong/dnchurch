import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import { Banner, QuickAccess, RecentSermons, NewHere, FeedSection } from '../_component/home';
import {
  BannerFallback,
  RecentSermonsFallback,
  FeedSectionFallback
} from '../_component/home/SectionFallbacks';

// canonical은 홈에서만 선언한다. root layout에 두면 하위 페이지가 canonical=홈으로 상속받아 중복 페이지로 오선언된다.
// openGraph는 공유 상수 전체를 펼친 뒤 url만 더한다 — Next.js는 shallow merge라 부분 선언 시 og:image 등이 사라진다.
// url은 설교 페이지와 같은 절대 URL 방식. 상대 '/'는 페이지 레벨에서 og:url로 emit되지 않고, env 미설정 시 undefined라 og:url이 안전하게 생략된다.
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: { ...OPEN_GRAPH_BASE, url: process.env.NEXT_PUBLIC_SITE_URL }
};

export default async function Home() {
  return (
    <>
      <Suspense fallback={<BannerFallback />}>
        <Banner />
      </Suspense>
      <QuickAccess />
      <Suspense fallback={<RecentSermonsFallback />}>
        <RecentSermons />
      </Suspense>
      <NewHere />
      <Suspense fallback={<FeedSectionFallback />}>
        <FeedSection />
      </Suspense>
    </>
  );
}
