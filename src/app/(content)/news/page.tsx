import { redirect } from 'next/navigation';

// /news는 교회 소식 진입점 — 주보 목록(/news/bulletins)으로 보낸다.
// 재export 대신 redirect로 둬야 헤더 '교회 소식'·형제 탭·활성 상태가 /news/bulletins에 정확히 붙는다.
export default function NewsPage() {
  redirect('/news/bulletins');
}
