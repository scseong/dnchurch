import type { Metadata } from 'next';
import Bulletin from './bulletins/page';

export const metadata: Metadata = {
  title: '교회 소식',
  // /news는 bulletins 페이지 재export라 같은 콘텐츠에 URL이 2개 — 검색엔진에는 원본만 알린다
  alternates: { canonical: '/news/bulletins' }
};

export default function News({
  searchParams
}: {
  searchParams: Promise<{ page: string; year: string }>;
}) {
  return <Bulletin searchParams={searchParams} />;
}
