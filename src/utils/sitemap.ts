import { sitemap } from '@/constants/sitemap';
import type { SitemapChild, SitemapItem } from '@/types/layout';

export function resolveCurrentNode(pathname: string): {
  parent: SitemapItem | null;
  child: SitemapChild | null;
} {
  for (const item of sitemap) {
    if (item.children) {
      const child = item.children.find((c) => pathname.startsWith(c.path));
      if (child) return { parent: item, child };
    }
    if (pathname.startsWith(item.path)) return { parent: item, child: null };
  }
  return { parent: null, child: null };
}

export function resolveHeroMeta(
  pathname: string,
  overrides: Record<string, string> = {}
): {
  title: string;
  description: string;
  heroImageId: string;
} {
  const { parent, child } = resolveCurrentNode(pathname);
  const node = child ?? parent;
  const key = pathToHeroImageKey(pathname);
  return {
    title: node?.title ?? '',
    description: node?.description ?? '',
    heroImageId: overrides[key] ?? node?.heroImageId ?? ''
  };
}

export function pathToHeroImageKey(path: string): string {
  return `hero_image${path.replaceAll('/', '_')}`;
}

export function getAllHeroImageKeys(): string[] {
  return sitemap.flatMap((item) => [
    pathToHeroImageKey(item.path),
    ...(item.children?.map((c) => pathToHeroImageKey(c.path)) ?? [])
  ]);
}
