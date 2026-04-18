import { Banner, QuickAccess, RecentSermons, NewHere, FeedSection } from '../_component/home';

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
