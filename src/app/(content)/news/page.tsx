import type { Metadata } from 'next';
import Bulletin from './bulletins/page';

export const metadata: Metadata = {
  title: '교회 소식'
};

export default function News({
  searchParams
}: {
  searchParams: Promise<{ page: string; year: string }>;
}) {
  return <Bulletin searchParams={searchParams} />;
}
