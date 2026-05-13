import type { Metadata } from 'next';
import { LayoutContainer } from '@/components/layout';

export const metadata: Metadata = {
  title: '전체 설교',
  description: '대구동남교회의 모든 설교를 검색·필터로 찾아보세요'
};

export default function AllSermonsPage() {
  return (
    <LayoutContainer>
      <h1>전체 설교</h1>
    </LayoutContainer>
  );
}
