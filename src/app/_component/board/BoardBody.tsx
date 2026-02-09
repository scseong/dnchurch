'use client';

import Photohotoswipe from '@/app/_component/common/Photohotoswipe';
import styles from './BoardBody.module.scss';

export default function BoardBody({ images }: { images: string[] }) {
  return (
    <div className={styles.body}>
      <div>
        <Photohotoswipe
          images={images}
          width={1024}
          height={768}
          renderImage={({ src, open, ref }) => <img ref={ref} src={src} onClick={open} />}
        />
      </div>
    </div>
  );
}
