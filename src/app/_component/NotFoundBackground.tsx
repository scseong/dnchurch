'use client';

import Image from 'next/image';
import type { ImageLoaderProps } from 'next/image';
import styles from '../not-found.module.scss';

// 배경 사진은 클라우드 루트의 public_id `not-found`를 쓴다. 공용 로더는 ROOT_FOLDER prefix를 붙여
// 경로가 어긋나므로, 여기서 width를 반영하는 전용 로더로 full URL을 만든다(인라인 loader는 client 전용).
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const backgroundLoader = ({ src, width, quality }: ImageLoaderProps) =>
  `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_${quality ?? 'auto'},c_fill,g_auto,w_${width}/${src}`;

export default function NotFoundBackground() {
  return (
    <div className={styles.photo}>
      <Image loader={backgroundLoader} src="not-found" alt="" fill sizes="100vw" priority />
    </div>
  );
}
