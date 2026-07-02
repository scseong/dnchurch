'use client';

import dynamic from 'next/dynamic';

// photoswipe·react-photoswipe-gallery·CSS를 라우트 초기 청크에서 분리하는 지연 경계.
// 서버 컴포넌트의 dynamic()은 코드 스플리팅이 안 되므로 client wrapper 안에서 감싼다.
// ssr 기본값 유지 — 주보 이미지는 SSR HTML에 남고 lightbox JS만 늦게 온다.
const PhotoSwipeLazy = dynamic(() => import('./PhotoSwipe'));

export default PhotoSwipeLazy;
