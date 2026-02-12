'use client';

import PhotoSwipe from '@/app/_component/common/PhotoSwipe';

export default function LatestBulletinImages({ images }: { images: string[] }) {
  if (images.length === 0) {
    return <img src="/images/no-image.jpg" alt="주보 이미지가 없습니다" />;
  }

  return (
    <PhotoSwipe
      imageUrls={images}
      sizes="(max-width: 768px) 100vw, 50vw"
      width={1920}
      srcsetWidths={[1200, 1920]}
      quality="auto:best"
    />
  );
}
