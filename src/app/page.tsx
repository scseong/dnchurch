import { Banner, GalleryCarousel, Greeting, LinkButtons } from './_component';

export default async function Home() {
  return (
    <>
      <Banner />
      <Greeting />
      <LinkButtons />
      <GalleryCarousel />
    </>
  );
}
