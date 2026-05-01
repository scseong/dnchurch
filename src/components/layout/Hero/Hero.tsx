'use client';

import { usePathname } from 'next/navigation';
import { resolveHeroMeta } from './hero.config';
import Breadcrumb from './Breadcrumb';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import styles from './Hero.module.scss';

export default function Hero() {
  const pathname = usePathname();
  const meta = resolveHeroMeta(pathname);

  if (!meta) return null;

  return (
    <section className={styles.hero} aria-label={`${meta.title} 히어로 섹션`}>
      <div className={styles.hero_bg} aria-hidden="true" />
      <div className={styles.hero_overlay} aria-hidden="true" />
      <LayoutContainer className={styles.hero_inner}>
        <Breadcrumb />
        <h1 className={styles.hero_title}>{meta.title}</h1>
        <p className={styles.hero_subtitle}>{meta.subtitle}</p>
      </LayoutContainer>
    </section>
  );
}
