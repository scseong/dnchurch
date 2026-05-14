import { GNB_ITEMS } from '@/config/navigation';

export type HeroMeta = {
  title: string;
  subtitle: string;
  eyebrow?: string;
  backgroundImage?: string;
};

/** 카테고리(prefix) 단위 기본 메타 — subtitle 소스 */
const HERO_META: Record<string, HeroMeta> = {
  '/about': { title: '교회 소개', subtitle: '대구동남교회를 소개합니다', eyebrow: 'ABOUT' },
  '/next-gen': { title: '다음세대', subtitle: '믿음의 다음 세대를 세웁니다', eyebrow: 'NEXT GEN' },
  '/sermons': { title: '설교', subtitle: '주일 말씀과 강해 설교를 만나보세요', eyebrow: 'SERMONS' },
  '/sermons/all': { title: '전체 설교', subtitle: '대구동남교회의 모든 설교를 검색·필터로 찾아보세요', eyebrow: 'ALL SERMONS' },
  '/sermons/series': { title: '모든 시리즈', subtitle: '대구동남교회 강해 설교 시리즈 목록', eyebrow: 'SERMON SERIES' },
  '/community': { title: '교제', subtitle: '함께 기도하고 나누는 공동체', eyebrow: 'COMMUNITY' },
  '/news': { title: '교회 소식', subtitle: '교회의 소식을 전해드립니다', eyebrow: 'NEWS' },
};

/**
 * pathname → HeroMeta 해석
 * - title: 현재 페이지의 GNB label (자식 레벨 우선)
 * - subtitle: HERO_META에서 카테고리 prefix 매칭
 * - GNB_ITEMS에 존재하는 페이지만 (상세 페이지 제외)
 */
export function resolveHeroMeta(pathname: string): HeroMeta | null {
  // direct match 우선 — HERO_META에 명시적으로 등록된 자식 라우트(예: /sermons/all)는 GNB_ITEMS children
  // 매칭보다 우선한다. 향후 GNB_ITEMS에 같은 path의 children을 추가해도 HERO_META direct가 이긴다.
  // child label 기반 동작이 필요해지면 이 분기를 loop 뒤로 옮기거나 HERO_META 엔트리를 제거해야 한다.
  const direct = HERO_META[pathname];
  if (direct) return direct;

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

    // 자식이 없는 경우: 부모 href 정확히 매칭만 (상세 페이지·Hub 제외)
    if (!item.children && pathname === item.href) {
      title = item.label;
      categoryKey = item.href.split('/').slice(0, 2).join('/');
      break;
    }
  }

  if (!title) return null;

  // HERO_META에서 카테고리 prefix로 subtitle 조회
  let subtitle = '';
  let eyebrow: string | undefined;
  for (const key of Object.keys(HERO_META)) {
    if (categoryKey.startsWith(key) && key.length > subtitle.length) {
      subtitle = HERO_META[key].subtitle;
      eyebrow = HERO_META[key].eyebrow;
    }
  }

  return { title, subtitle, eyebrow };
}
