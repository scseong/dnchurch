'use client';

import PhotoSwipe from '@/app/_component/common/PhotoSwipe';

export default function LatestBulletinImages({ images }: { images: string[] }) {
  if (images.length === 0) {
    return <img src="/images/no-image.jpg" alt="주보 이미지가 없습니다" />;
  }

  return (
    <PhotoSwipe
      imageUrls={images}
      width={1600}
      sizes="(max-width: 768px) 100vw, 50vw"
      srcsetWidths={[640, 800, 1200, 1600]}
      quality="auto:good"
    />
  );
}
