export type ImageState = {
  w: number;
  h: number;
  loaded: boolean;
};

export type FallbackSize = {
  w: number;
  h: number;
};

export type PhotoSwipeProps = {
  images: string[];
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  /** 각 이미지에 'i / N' 페이지 배지 + '확대' 힌트 오버레이를 켠다. 기본 false(기존 사용처 영향 없음). */
  pageBadge?: boolean;
};
