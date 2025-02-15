import { Banner, Greeting, HomeGallery, LinkButtons } from './_component/home';

export default async function Home() {
  return (
    <>
      <Banner />
      <Greeting />
      <LinkButtons />
      <HomeGallery />
    </>
  );
}
