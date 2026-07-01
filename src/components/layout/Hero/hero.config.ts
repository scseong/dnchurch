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
  '/community': { title: '교제', subtitle: '함께 기도하고 나누는 공동체', eyebrow: 'COMMUNITY' },
  '/news': { title: '교회 소식', subtitle: '교회의 소식을 전해드립니다', eyebrow: 'NEWS' },
};

/**
 * 레이아웃 자동 Hero를 끄는 경로.
 * - /about: hub가 자체 다크 hero를 직접 렌더한다(중복 방지).
 * - /about/pastor·/about/worship·/about/location·/about/vision·/about/welcome: 목업 재설계 — Hero 없이 in-page warm 탭 내비 + 카드로 구성한다(about-warm-redesign·about-children-redesign).
 * - /sermons: 목업 재설계 — Hero 밴드 대신 헤더 '설교' 타이틀 + 검색 인풋으로 구성한다(sermon-home-redesign). HERO_META['/sermons']는 자식(/sermons/all·/series)의 subtitle 소스로 남긴다.
 * - /sermons/all·/sermons/series: 목업 재설계 — Hero 없이 헤더 타이틀 + 콘텐츠로 구성한다(sermon-views-redesign).
 */
const SELF_HERO_PATHS = new Set([
  '/about',
  '/about/pastor',
  '/about/worship',
  '/about/location',
  '/about/vision',
  '/about/welcome',
  '/sermons',
  '/sermons/all',
  '/sermons/series'
]);

/**
 * pathname → HeroMeta 해석
 * - title: 현재 페이지의 GNB label (자식 레벨 우선)
 * - subtitle: HERO_META에서 카테고리 prefix 매칭
 * - GNB_ITEMS에 존재하는 페이지만 (상세 페이지 제외)
 */
export function resolveHeroMeta(pathname: string): HeroMeta | null {
  // 자체 hero 페이지(about/page.tsx의 다크 hero)는 자동 Hero를 끈다. HERO_META['/about']
  // 엔트리는 자식(/about/welcome 등)의 subtitle 소스로 계속 쓰이므로 남긴다.
  if (SELF_HERO_PATHS.has(pathname)) return null;

  // direct match — HERO_META 키는 모두 카테고리 hub(/about·/sermons 등)이며 GNB_ITEMS 부모로도
  // 매칭된다. 즉 direct에만 의존하는 라우트는 0건이라 아래 loop와 결과가 같다(중복 fast-path).
  // /sermons/all·/sermons/series는 GNB '설교' children으로 옮겼으므로 loop가 라벨을 해석한다.
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

  // subtitle·eyebrow는 카테고리 메타에서 조회. categoryKey는 항상 2-세그먼트 루트(GNB 부모 href)이고
  // HERO_META 키도 전부 2-세그먼트 루트라 직접 조회로 충분하다.
  const categoryMeta = HERO_META[categoryKey];
  const subtitle = categoryMeta?.subtitle ?? '';
  const eyebrow = categoryMeta?.eyebrow;

  return { title, subtitle, eyebrow };
}
