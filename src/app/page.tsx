import { Banner, HomeHero, Greeting, HomeGallery, LinkButtons } from './_component/home';

export default async function Home() {
  return (
    <>
      <HomeHero />
      {/* <Banner /> */}
      <Greeting />
      <LinkButtons />
      {/* <HomeGallery /> */}
    </>
  );
}
