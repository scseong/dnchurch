'use client';

import { usePathname } from 'next/navigation';
import { resolveHeroMeta } from '@/utils/sitemap';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './HeroSection.module.scss';

type Props = {
  heroImageOverrides?: Record<string, string>;
};

export default function HeroSection({ heroImageOverrides = {} }: Props) {
  const pathname = usePathname();
  const { title, description, heroImageId } = resolveHeroMeta(pathname, heroImageOverrides);

  return (
    <section className={styles.hero} aria-label={`${title} 히어로 섹션`}>
      <div className={styles.bg}>
        <CloudinaryImage
          src={heroImageId}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 1440px"
          preload
          fetchPriority="high"
        />
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
