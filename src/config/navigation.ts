// ══════════════════════════════════════════
// Navigation — GNB와 BottomNav가 공유하는 단일 메뉴 소스
// ══════════════════════════════════════════

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
};

export type IconName = 'home' | 'about' | 'nextgen' | 'sermon' | 'mypage';

export type BottomNavItem = {
  label: string;
  href: string;
  icon: IconName;
};

export const GNB_ITEMS: NavItem[] = [
  {
    label: '교회 소개',
    href: '/about',
    children: [
      { label: '인사말', href: '/about/pastor' },
      { label: '교회의 비전', href: '/about/vision' },
      { label: '예배안내', href: '/about/worship' },
      { label: '오시는 길', href: '/about/location' },
      { label: '환영합니다', href: '/about/welcome' },
      { label: '섬기는 사람들', href: '/about/serving-people' },
    ],
  },
  {
    label: '다음세대',
    href: '/next-gen',
  },
  {
    label: '설교',
    href: '/sermons',
    children: [
      { label: '전체 설교', href: '/sermons/all' },
      { label: '모든 시리즈', href: '/sermons/series' },
    ],
  },
  {
    label: '교제',
    href: '/community',
  },
  {
    label: '교회 소식',
    href: '/news',
    children: [
      { label: '공지사항', href: '/news/notices' },
      { label: '주보', href: '/news/bulletins' },
      { label: '갤러리', href: '/news/gallery' },
    ],
  },
];

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { label: '홈', href: '/', icon: 'home' },
  { label: '소개', href: '/about', icon: 'about' },
  { label: '다음세대', href: '/next-gen', icon: 'nextgen' },
  { label: '설교', href: '/sermons', icon: 'sermon' },
  { label: '마이페이지', href: '/mypage', icon: 'mypage' },
];

// ── Active 판별 ──

/** 경계 인식 경로 매칭 — href 자신 또는 그 하위 세그먼트만 true. bare startsWith의 형제 prefix 오탐(`/newsroom`이 `/news`에 걸림)을 막는다. */
function isRouteMatch(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

/** GNB 메뉴 활성 판별: children이 있으면 children href로도 매칭 */
export function isActiveGnb(pathname: string, item: NavItem): boolean {
  if (item.href === '/') return pathname === '/';

  if (isRouteMatch(pathname, item.href)) return true;

  return item.children?.some((child) => isRouteMatch(pathname, child.href)) ?? false;
}

/** BottomNav 활성 판별: 카테고리(첫 번째 세그먼트) 단위 매칭 */
export function isActiveBottomNav(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  if (href === '/menu') return false;

  const category = '/' + href.split('/').filter(Boolean)[0];
  return isRouteMatch(pathname, category);
}

// ── Label 해석 (Hero · MobileHeader) ──

function buildLabelMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const item of GNB_ITEMS) {
    map.set(item.href, item.label);
    if (item.children) {
      for (const child of item.children) {
        map.set(child.href, child.label);
      }
    }
  }
  return map;
}

const labelMap = buildLabelMap();

/** pathname → 표시 라벨 (Hero 타이틀 등) */
export function resolveNavLabel(pathname: string): string {
  const exact = labelMap.get(pathname);
  if (exact) return exact;

  const segments = pathname.split('/');
  for (let i = segments.length - 1; i > 0; i--) {
    const parentPath = segments.slice(0, i).join('/') || '/';
    const parentLabel = labelMap.get(parentPath);
    if (parentLabel) return parentLabel;
  }

  return '';
}

// ── MobileHeader ──

const SPECIAL_PAGES: Record<string, string> = {
  '/mypage': '마이페이지',
  '/login': '로그인',
  '/sign-up': '회원가입',
  '/privacy-policy': '개인정보처리방침',
};

// 목업 재설계로 자체 in-page 섹션 탭(AboutTabNav)을 렌더하는 About 페이지.
// 헤더는 '교회 소개' 타이틀 + 뒤로가기로 두고, 형제 탭은 끈다(AboutTabNav가 대체).
export const ABOUT_REDESIGNED_ROUTES = new Set([
  '/about/pastor',
  '/about/worship',
  '/about/location',
  '/about/vision',
  '/about/welcome'
]);

/** 모바일 헤더 타이틀 + 뒤로가기 상태 해석 */
export function resolveMobileHeader(pathname: string): { title: string; showBack: boolean } {
  if (pathname === '/') return { title: '대구동남교회', showBack: false };

  // 목업 재설계: About 교회 소개 화면은 헤더에 '교회 소개' 타이틀 + 뒤로가기로 둔다(목업 일치).
  if (ABOUT_REDESIGNED_ROUTES.has(pathname)) return { title: '교회 소개', showBack: true };

  // 목업 재설계: 설교 홈은 Hero 밴드 대신 헤더 '설교' 타이틀 + 뒤로가기로 둔다(sermon-home-redesign).
  if (pathname === '/sermons') return { title: '설교', showBack: true };

  const special = SPECIAL_PAGES[pathname];
  if (special) return { title: special, showBack: false };

  for (const item of GNB_ITEMS) {
    if (!item.children) {
      if (pathname === item.href) return { title: item.label, showBack: false };
      if (pathname.startsWith(item.href + '/')) return { title: item.label, showBack: true };
      continue;
    }

    if (pathname === item.href) return { title: item.label, showBack: false };

    const matched = item.children.find((c) => isRouteMatch(pathname, c.href));
    if (matched) {
      return { title: item.label, showBack: pathname !== matched.href };
    }

    // 카테고리 하위지만 자식 목록에 없는 경로(예: /sermons/[id] 상세) — 카테고리 라벨 유지
    if (pathname.startsWith(item.href + '/')) {
      return { title: item.label, showBack: true };
    }
  }

  return { title: '대구동남교회', showBack: true };
}

/** 현재 카테고리의 형제 탭 (children이 없으면 null) */
export function resolveSiblingTabs(pathname: string): NavItem[] | null {
  // 목업 재설계로 자체 in-page 섹션 탭(AboutTabNav)을 렌더하는 페이지는 헤더 형제 탭을 끈다(중복 방지).
  if (ABOUT_REDESIGNED_ROUTES.has(pathname)) return null;

  for (const item of GNB_ITEMS) {
    if (!item.children?.length) continue;
    if (item.children.some((c) => isRouteMatch(pathname, c.href))) {
      return item.children;
    }
  }
  return null;
}

// ── Breadcrumb 세그먼트 해석 ──

/** pathname을 GNB 기반으로 분해하여 [카테고리, 하위페이지] 세그먼트 반환 */
export function resolveBreadcrumbSegments(
  pathname: string
): { label: string; href: string }[] {
  const segments: { label: string; href: string }[] = [];

  for (const item of GNB_ITEMS) {
    if (!isActiveGnb(pathname, item)) continue;

    segments.push({ label: item.label, href: item.href });

    if (item.children) {
      const matched = item.children.find((c) => isRouteMatch(pathname, c.href));
      if (matched) {
        segments.push({ label: matched.label, href: matched.href });
      }
    }
    break;
  }

  // GNB에 없는 특수 페이지(검색·알림 등)는 단일 세그먼트로 표시
  if (segments.length === 0) {
    const special = SPECIAL_PAGES[pathname];
    if (special) segments.push({ label: special, href: pathname });
  }

  return segments;
}
