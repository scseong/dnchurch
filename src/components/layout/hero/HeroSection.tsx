'use client';

import { usePathname } from 'next/navigation';
import { sitemap } from '@/constants/sitemap';
import type { AppSitemapNode } from '@/types/layout';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import styles from './HeroSection.module.scss';

type Props = {
  heroImages?: Record<string, string>;
};

/** pathname에 매칭되는 노드를 트리에서 찾아 label을 반환 */
function resolveLabel(nodes: readonly AppSitemapNode[], pathname: string): string {
  for (const node of nodes) {
    if (node.path === pathname) return node.label;
    if (node.children) {
      const found = resolveLabel(node.children, pathname);
      if (found) return found;
    }
  }
  return '';
}

function pathToHeroImageKey(path: string): string {
  return `hero_image${path.replaceAll('/', '_')}`;
}

export default function HeroSection({ heroImages = {} }: Props) {
  const pathname = usePathname();
  const title = resolveLabel(sitemap, pathname);
  const key = pathToHeroImageKey(pathname);
  const heroImageId = heroImages[key] ?? '';

  if (!title) return null;

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
      </div>
    </section>
  );
}
