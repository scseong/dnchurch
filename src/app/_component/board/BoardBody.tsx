'use client';

import PhotoSwiper from '@/app/_component/common/PhotoSwiper';
import styles from './BoardBody.module.scss';

export default function BoardBody({ images }: { images: string[] }) {
  return (
    <div className={styles.body}>
      <PhotoSwiper images={images} />
    </div>
  );
}
