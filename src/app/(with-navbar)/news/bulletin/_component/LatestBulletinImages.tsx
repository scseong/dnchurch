'use client';

import PhotoSwiper from '@/app/_component/common/PhotoSwiper';

type Props = {
  title?: string;
  images: string[];
};

export default function LatestBulletinImages({ title, images }: Props) {
  if (images.length === 0) {
    return <img src="/images/no-image.jpg" alt="주보 이미지가 없습니다" />;
  }

  return <PhotoSwiper images={images} aspectRatio="4:3" />;
}
