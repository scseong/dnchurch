import { Banner, Greeting, HomeAbout } from './_component/home';

export default async function Home() {
  return (
    <>
      <Banner />
      <HomeAbout />
      <Greeting />
      {/* <LinkButtons /> */}
      {/* <HomeGallery /> */}
    </>
  );
}
