import type { Metadata } from 'next';
import { Banner, QuickAccess, RecentSermons, NewHere, FeedSection } from '../_component/home';

// canonical은 홈에서만 선언한다. root layout에 두면 하위 페이지가 canonical=홈으로 상속받아 중복 페이지로 오선언된다.
// openGraph는 건드리지 않는다 — Next.js metadata는 shallow merge라, 여기서 openGraph를 부분 선언하면 root의 og:image·locale·siteName이 통째로 사라진다.
export const metadata: Metadata = {
  alternates: { canonical: '/' }
};

export default async function Home() {
  return (
    <>
      <Banner />
      <QuickAccess />
      <RecentSermons />
      <NewHere />
      <FeedSection />
    </>
  );
}
