import { sitemap } from '@/constants/sitemap';
import type { AppSitemapNode } from '@/types/layout';

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
 * 현재 경로에 따른 AppHeader 모드를 결정한다.
 * - `/` → logo
 * - 상세 페이지(동적 세그먼트) → back + 부모 섹션 label
 * - 나머지 → 해당 경로의 label을 title로 표시
 */
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

  return { type: 'back', label: '', path: '/' };
};

/** PC 상단 네비게이션 — 전체 탭 소멸, 마이페이지 별도 */
export const PC_NAV_ITEMS = sitemap.filter(
  (item) =>
    item.path !== '/' &&
    item.path !== '/mypage' &&
    item.path !== '/notifications' &&
    item.path !== '/search'
);
