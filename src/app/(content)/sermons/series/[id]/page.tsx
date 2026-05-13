import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';

export const metadata: Metadata = {
  title: '시리즈 상세',
  description: '대구동남교회 강해 설교 시리즈 상세'
};

export default function SeriesDetailPage() {
  return (
    <LayoutContainer>
      <h1>시리즈 상세</h1>
    </LayoutContainer>
  );
}
