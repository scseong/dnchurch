import { Banner, QuickAccess, RecentSermons, FeedSection } from './_component/home';

export default async function Home() {
  return (
    <>
      <Banner />
      <QuickAccess />
      <RecentSermons />
      <FeedSection />
    </>
  );
}
