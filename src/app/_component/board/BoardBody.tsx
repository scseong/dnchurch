'use client';

import PhotoSwipe from '@/app/_component/common/PhotoSwipe';
import styles from './BoardBody.module.scss';

export default function BoardBody({ images }: { images: string[] }) {
  return (
    <div className={styles.body}>
      <PhotoSwipe
        imageUrls={images}
        width={2105}
        height={1488}
        sizes="100vw"
        className={styles.photo_image}
      />
    </div>
  );
}
