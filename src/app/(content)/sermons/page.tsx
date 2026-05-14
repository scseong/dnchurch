import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';
import { getFeaturedSermon } from '@/services/sermon';
import SermonFeatured from './_component/SermonFeatured/SermonFeatured';

export const metadata: Metadata = {
  title: '설교',
  description: '대구동남교회 설교 영상과 말씀을 만나보세요.'
};

export default async function SermonsPage() {
  const featured = await getFeaturedSermon();

  return (
    <LayoutContainer>
      <SermonFeatured sermon={featured} />
    </LayoutContainer>
  );
}
