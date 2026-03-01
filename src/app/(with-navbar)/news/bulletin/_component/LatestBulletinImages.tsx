'use client';

import PhotoSwipe from '@/components/common/PhotoSwipe';

export default function LatestBulletinImages({ images }: { images: string[] }) {
  if (images.length === 0) {
    return <img src="/images/no-image.jpg" alt="주보 이미지가 없습니다" />;
  }

  return <PhotoSwipe images={images} width={2105} height={1488} />;
}
