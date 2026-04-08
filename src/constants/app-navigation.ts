import { sitemap } from '@/constants/sitemap';
import type { AppSitemapNode } from '@/types/layout';

// ── 내비게이션 공통 필터 ──

const EXCLUDED_PATHS = new Set(['/', '/mypage', '/notifications', '/search']);

/** 내비게이션에 표시할 최상위 메뉴 항목 (detail·유틸 경로 제외) */
export const NAV_ITEMS = sitemap.filter(
  (item) => !item.detail && !EXCLUDED_PATHS.has(item.path)
);

/** 모바일 하단 탭 바 — 5탭 */
export const TAB_ITEMS = [
  { key: 'home', label: '홈', path: '/' },
  { key: 'sermons', label: '말씀', path: '/sermons' },
  { key: 'news', label: '주보', path: '/news/bulletins' },
  { key: 'community', label: '교제', path: '/community' },
  { key: 'menu', label: '전체' }
] as const;

export type TabKey = (typeof TAB_ITEMS)[number]['key'];

/** 현재 경로에 매칭되는 탭 key 반환 */
export const getActiveTabKey = (pathname: string): TabKey | null => {
  if (pathname === '/') return 'home';

  const tab = TAB_ITEMS.find((t) => 'path' in t && t.path !== '/' && pathname.startsWith(t.path));
  return tab?.key ?? null;
};

// ── AppHeader 라벨 해석 ──

/** sitemap 트리를 평탄화하여 path → label 맵 생성 (detail 라우트 제외) */
function flattenLabels(
  nodes: readonly AppSitemapNode[],
  map: Map<string, string> = new Map()
): Map<string, string> {
  for (const node of nodes) {
    if (!node.detail) {
      map.set(node.path, node.label);
    }
    if (node.children) {
      flattenLabels(node.children, map);
    }
  }
  return map;
}

const labelMap = flattenLabels(sitemap);

export type HeaderMode =
  | { type: 'logo' }
  | { type: 'title'; label: string }
  | { type: 'back'; label: string; path: string };

/**
 * 현재 경로의 부모 섹션이 가진 non-detail children을 반환한다.
 * children이 없거나 1개 이하이면 null 반환.
 */
export const resolveSubNav = (
  pathname: string
): { parentLabel: string; items: { path: string; label: string }[] } | null => {
  for (const node of sitemap) {
    if (!node.children) continue;

    const staticChildren = node.children.filter((c) => !c.detail);
    if (staticChildren.length <= 1) continue;

    const isMatch =
      pathname === node.path ||
      staticChildren.some((c) => pathname.startsWith(c.path));

    if (isMatch) {
      return {
        parentLabel: node.label,
        items: staticChildren.map((c) => ({ path: c.path, label: c.label })),
      };
    }
  }
  return null;
};

export const resolveHeaderMode = (pathname: string): HeaderMode => {
  if (pathname === '/') return { type: 'logo' };

  // labelMap에서 정확히 매칭되면 title 모드
  const exactLabel = labelMap.get(pathname);
  if (exactLabel) return { type: 'title', label: exactLabel };

  // 상세 페이지 → 가장 가까운 부모 경로의 label을 찾아 back 모드로 반환
  const segments = pathname.split('/');
  for (let i = segments.length - 1; i > 0; i--) {
    const parentPath = segments.slice(0, i).join('/') || '/';
    const parentLabel = labelMap.get(parentPath);
    if (parentLabel) return { type: 'back', label: parentLabel, path: parentPath };
  }

  return { type: 'back', label: '대구동남교회', path: '/' };
};
