import type { Metadata } from 'next';

// root layout과 홈이 공유하는 OpenGraph 기본값.
// 홈은 여기에 url만 더해 전체를 선언한다 — Next.js는 openGraph를 shallow merge하므로,
// 부분만 선언하면 여기 없는 필드(og:image 등)가 사라진다.
// title은 일부러 두지 않는다 — openGraph.title 템플릿을 페이지가 명시 선언하면 페이지 제목에 또 적용돼 "대구동남교회 | 대구동남교회"로 중복된다.
// 비워 두면 Next.js가 문서 title에서 og:title을 자동 유도한다.
export const OPEN_GRAPH_BASE: Metadata['openGraph'] = {
  type: 'website',
  locale: 'ko_KR',
  siteName: '대구동남교회',
  description: '주님의 기도를 배우는 교회(성도), 동남교회',
  images: ['/images/aboutBanner.jpg']
};
