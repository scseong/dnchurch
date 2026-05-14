import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';

export const metadata: Metadata = {
  title: '모든 시리즈',
  description: '대구동남교회 강해 설교 시리즈 목록'
};

export default function AllSeriesPage() {
  return (
    <LayoutContainer>
      <h1>모든 시리즈</h1>
    </LayoutContainer>
  );
}
