import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LayoutContainer } from '@/components/layout';
import { getFeaturedSermon } from '@/services/sermon';
import SermonFeatured from './_component/SermonFeatured/SermonFeatured';

export const metadata: Metadata = {
  title: '설교',
  description: '대구동남교회 설교 영상과 말씀을 만나보세요.'
};

type SermonsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// archive 뷰는 `/sermons/all`로 이관됨 (2026-05-14, exec-plan sermons-featured).
// 기존 공유·인덱싱된 필터 URL(`/sermons?series=...&year=...&q=...`)이 Featured 카드만 보여주는 회귀를 막기 위해
// 쿼리가 존재하면 `/sermons/all`로 query를 보존해 redirect한다.
export default async function SermonsPage({ searchParams }: SermonsPageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) value.forEach((v) => qs.append(key, v));
    else qs.append(key, value);
  }
  const query = qs.toString();
  if (query) redirect(`/sermons/all?${query}`);

  const featured = await getFeaturedSermon();

  return (
    <LayoutContainer>
      <SermonFeatured sermon={featured} />
    </LayoutContainer>
  );
}
