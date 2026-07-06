import type { Metadata } from 'next';

// 공유 미리보기(og:image)·JSON-LD의 기본 이미지. 페이지·콘텐츠 전용 이미지가 없을 때 fallback으로 쓴다.
// 한 곳에 모아 OPEN_GRAPH_BASE와 CHURCH_INFO가 같은 배너를 가리키게 한다(경로 드리프트 방지).
export const OG_FALLBACK_IMAGE = '/images/aboutBanner.jpg';

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
  images: [OG_FALLBACK_IMAGE]
};

// JSON-LD 구조화 데이터와 location 페이지가 공유하는 교회 식별·위치 상수.
// site_settings DB가 비어 있어도 유효한 구조화 데이터가 나오도록 안정 불변값(좌표·주소·교단)을 fallback으로 둔다.
// phone/email/zipcode는 여기 두지 않는다 — site_settings에서 받아 시드 후 두 출처가 어긋날 위험을 없앤다.
export const CHURCH_INFO = {
  name: '대구동남교회',
  legalName: '대한예수교장로회(합신) 대구동남교회',
  address: {
    streetAddress: '달구벌대로307길 58',
    addressLocality: '달서구',
    addressRegion: '대구광역시',
    addressCountry: 'KR'
  },
  geo: {
    latitude: 35.85262832577055,
    longitude: 128.53467835707838
  },
  image: OG_FALLBACK_IMAGE
} as const;
