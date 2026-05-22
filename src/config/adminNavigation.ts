// ══════════════════════════════════════════
// Admin Navigation — 어드민 사이드바와 브레드크럼이 공유하는 단일 sitemap
// ══════════════════════════════════════════

export type AdminIconName = 'home' | 'play' | 'folder' | 'user' | 'users' | 'cog';

export type AdminNavItem = {
  label: string;
  href: string;
  icon: AdminIconName;
  badge?: string;
};

export type AdminNavSection = {
  title: string;
  items: AdminNavItem[];
};

export const ADMIN_ROOT = '/admin';

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    title: '메인',
    items: [{ label: '대시보드', href: '/admin', icon: 'home' }]
  },
  {
    title: '설교',
    items: [
      { label: '설교 관리', href: '/admin/sermons', icon: 'play', badge: '128' },
      { label: '시리즈 관리', href: '/admin/sermons/series', icon: 'folder', badge: '24' },
      { label: '설교자 관리', href: '/admin/sermons/speakers', icon: 'user' }
    ]
  },
  {
    title: '멤버',
    items: [{ label: '멤버 관리', href: '/admin/members', icon: 'users' }]
  },
  {
    title: '시스템',
    items: [{ label: '설정', href: '/admin/settings', icon: 'cog' }]
  }
];

// ── Active 판별 ──

/**
 * 사이드바 메뉴 활성 판별.
 * 대시보드(/admin)는 정확히 일치할 때만, 나머지는 하위 경로까지 포함.
 */
export function isActiveAdminNav(pathname: string, href: string): boolean {
  if (href === ADMIN_ROOT) return pathname === ADMIN_ROOT;
  return pathname === href || pathname.startsWith(href + '/');
}

// ── Breadcrumb ──

/**
 * 어드민 경로 → AdminHeader 브레드크럼 라벨 배열.
 * dynamic 경로(설교 수정)는 페이지가 `useAdminBreadcrumbStore.setDynamicLabel`로
 * 실제 라벨을 주입한다. 미주입 시 임시 플레이스홀더로 fallback.
 */
export function resolveAdminBreadcrumbs(
  pathname: string,
  dynamicLabel?: string | null
): string[] {
  const root = '관리자';

  if (pathname === '/admin') return [root, '대시보드'];

  if (pathname === '/admin/sermons') return [root, '설교 관리'];
  if (pathname === '/admin/sermons/new') return [root, '설교 관리', '새 설교 등록'];
  if (/^\/admin\/sermons\/[^/]+\/edit$/.test(pathname))
    return [root, '설교 관리', dynamicLabel?.trim() || '(설교 제목)'];

  if (pathname === '/admin/sermons/series') return [root, '설교 관리', '시리즈 관리'];
  if (pathname === '/admin/sermons/speakers') return [root, '설교 관리', '설교자 관리'];

  if (pathname.startsWith('/admin/members')) return [root, '멤버 관리'];
  if (pathname.startsWith('/admin/settings')) return [root, '설정'];

  return [root];
}
