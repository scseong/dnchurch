'use client';

import Photohotoswipe from '@/app/_component/common/Photohotoswipe';

type Props = {
  title?: string;
  images: string[];
};

export default function LatestBulletinImages({ title, images }: Props) {
  if (images.length === 0) {
    return <img src="/images/no-image.jpg" alt="주보 이미지가 없습니다" />;
  }

  return (
    <Photohotoswipe
      images={images}
      width={1200}
      height={900}
      renderImage={({ src, open, ref, index }) => (
        <div>
          <img ref={ref} src={src} alt={`${title ?? '주보'} - ${index + 1}`} onClick={open} />
        </div>
      )}
    />
  );
}
