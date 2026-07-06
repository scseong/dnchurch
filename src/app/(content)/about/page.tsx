import type { Metadata } from 'next';
import PastorGreeting from '@/app/(content)/about/_component/PastorGreeting';
import { OPEN_GRAPH_BASE } from '@/config/seo';

// /about은 교회 소개 진입점 — redirect 없이 인사말을 직접 렌더한다. canonical은 /about/pastor로 통일.
export const metadata: Metadata = {
  title: '인사말',
  description: '대구동남교회 담임목사 인사말',
  alternates: { canonical: '/about/pastor' },
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '인사말',
    description: '대구동남교회 담임목사 인사말'
  }
};

export default function AboutPage() {
  return <PastorGreeting />;
}
