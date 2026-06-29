import { redirect } from 'next/navigation';

// /about 허브는 탭 기반 About 섹션으로 통합 — 첫 탭(인사말)으로 보낸다.
// BottomNav·GNB·홈 카드 등 기존 /about 링크는 모두 이 redirect를 거쳐 /about/pastor로 도착한다.
export default function AboutPage() {
  redirect('/about/pastor');
}
