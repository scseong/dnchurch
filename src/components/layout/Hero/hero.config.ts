import { GNB_ITEMS } from '@/config/navigation';

export type HeroMeta = {
  title: string;
  subtitle: string;
  backgroundImage?: string;
};

/** 카테고리(prefix) 단위 기본 메타 — subtitle 소스 */
const HERO_META: Record<string, HeroMeta> = {
  '/about': { title: '교회 소개', subtitle: '대구동남교회를 소개합니다' },
  '/next-gen': { title: '다음세대', subtitle: '믿음의 다음 세대를 세웁니다' },
  '/sermons': { title: '설교', subtitle: '주일 말씀과 강해 설교를 만나보세요' },
  '/community': { title: '교제', subtitle: '함께 기도하고 나누는 공동체' },
  '/news': { title: '교회 소식', subtitle: '교회의 소식을 전해드립니다' },
};

/**
 * pathname → HeroMeta 해석
 * - title: 현재 페이지의 GNB label (자식 레벨 우선)
 * - subtitle: HERO_META에서 카테고리 prefix 매칭
 * - GNB_ITEMS에 존재하는 페이지만 (상세 페이지 제외)
 */
export function resolveHeroMeta(pathname: string): HeroMeta | null {
  let title = '';
  let categoryKey = '';

  for (const item of GNB_ITEMS) {
    // 자식이 있는 경우: 자식 href로 정확히 매칭
    if (item.children) {
      const matched = item.children.find((c) => pathname === c.href);
      if (matched) {
        title = matched.label;
        categoryKey = item.href.split('/').slice(0, 2).join('/');
        break;
      }
    }

    // 자식이 없는 경우: 부모 href 정확히 매칭
    if (pathname === item.href) {
      title = item.label;
      categoryKey = item.href.split('/').slice(0, 2).join('/');
      break;
    }
  }

  if (!title) return null;

  // HERO_META에서 카테고리 prefix로 subtitle 조회
  let subtitle = '';
  for (const key of Object.keys(HERO_META)) {
    if (categoryKey.startsWith(key) && key.length > subtitle.length) {
      subtitle = HERO_META[key].subtitle;
    }
  }

  return { title, subtitle };
}
