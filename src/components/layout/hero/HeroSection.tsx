'use client';

import { usePathname } from 'next/navigation';
import { resolveHeroMeta } from '@/utils/sitemap';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './HeroSection.module.scss';

export default function HeroSection() {
  const pathname = usePathname();
  const { title, description, heroImageId } = resolveHeroMeta(pathname);

  return (
    <section className={styles.hero} aria-label={`${title} 히어로 섹션`}>
      <div className={styles.bg}>
        <CloudinaryImage src={heroImageId} alt={title} fill preload sizes="100vw" />
        <div className={styles.overlay} aria-hidden="true" />
      </div>
      <div className={styles.content}>
        <p className={styles.eyebrow}>DONGNAM CHURCH</p>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.desc}>{description}</p>}
      </div>
    </section>
  );
}
