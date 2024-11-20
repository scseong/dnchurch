import Banner from './_component/Banner';
import Greeting from './_component/Greeting';
import LinkButtons from './_component/LinkButtons';

export default async function Home() {
  return (
    <>
      <Banner />
      <Greeting />
      <LinkButtons />
    </>
  );
}
