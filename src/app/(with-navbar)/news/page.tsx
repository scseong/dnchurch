import Bulletin from './bulletin/page';

export default function News({
  searchParams
}: {
  searchParams: Promise<{ page: string; year: string }>;
}) {
  return <Bulletin searchParams={searchParams} />;
}
