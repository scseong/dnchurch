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
};
