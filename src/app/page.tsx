import {
  Banner,
  QuickAccess,
  RecentSermons,
  AboutOurChurch,
  ChurchVision
} from './_component/home';

export default async function Home() {
  return (
    <>
      <Banner />
      <QuickAccess />
      <RecentSermons />
    </>
  );
}
