'use client';

import PhotoSwipe from '@/app/_component/common/PhotoSwipe';
import styles from './BoardBody.module.scss';

export default function BoardBody({ images }: { images: string[] }) {
  return (
    <div className={styles.body}>
      <PhotoSwipe imageUrls={images} width={1920} srcsetWidths={[800, 1600, 1920]} priority />
    </div>
  );
}
