# 사이트맵 일관성 진단 — Header · Drawer · Breadcrumb

작성일: 2026-05-22
대상: `src/config/navigation.ts`, `src/config/adminNavigation.ts`, `src/components/layout/Hero/hero.config.ts`, 그리고 이를 소비하는 Header/Drawer/Hero/Breadcrumb/BottomNav/AdminHeader/AdminSidebar.
목적: 현재 사이트맵의 라벨·경로·활성 상태가 채널별로 어긋나는 지점을 사실 단위로 정리하고, 단계적 개선안 세 가지를 트레이드오프와 함께 제시한다.

---

## 요약

- **카테고리 페이지가 GNB에서 누락된다.** `/next-gen`, `/community`, `/news`는 `page.tsx`가 있고 Hero도 정상 표시되지만, GNB·Drawer·Breadcrumb·MobileHeader는 어느 항목도 활성으로 잡지 못한다. GNB의 부모 `href`가 카테고리 경로가 아닌 첫 자식 경로(`/community/prayer` 등)를 가리키는 게 원인.
- **SSOT가 둘로 갈라져 있다.** `GNB_ITEMS`와 `HERO_META`가 라벨·경로를 각각 정의한다. `/sermons/all`·`/sermons/series`는 Hero에만 있고 GNB·Breadcrumb에는 없어, 같은 화면에서 Hero 제목과 Breadcrumb 끝 라벨이 어긋난다.
- **고아 페이지와 가짜 라우트가 섞여 있다.** `/fellowship`, `/about/serving-people`, `/news/bulletins/create`, `/news/bulletins/[id]/update`는 메뉴에서 접근 불가. `/menu`는 BottomNav가 가리키지만 `page.tsx`가 없어 404로 떨어진다.
- **Admin 사이드바 절반은 빈 페이지로 가는 링크다.** `/admin/sermons/series`, `/admin/sermons/speakers`, `/admin/members`, `/admin/settings`는 사이드바·Breadcrumb에 정의돼 있지만 `page.tsx`가 없다. `128`·`24` 같은 badge는 하드코딩 가짜 숫자.
- **Public ↔ Admin Breadcrumb 자료형이 다르다.** Public은 링크 가능한 `{label, href}[]`, Admin은 plain `string[]`. 결정 방식도 GNB 매칭 vs if-체인으로 갈리고, 한 앱에 두 종류 Breadcrumb이 공존한다.
- **권장 경로**: 1차로 사실 정정만 담은 미니멀 패치(옵션 A), 2차로 채널 통합 `SITE_MAP` 매니페스트(옵션 B). 옵션 C(페이지 콜로케이션)는 현재 규모 대비 비용 과함.

---

## 1. 진단 범위와 데이터 흐름

### Public

| 채널 | 컴포넌트 | 데이터 소스 |
| --- | --- | --- |
| 데스크톱 GNB | `Header/DesktopHeader.tsx` | `GNB_ITEMS` (navigation.ts:19) |
| 모바일 헤더 타이틀 | `Header/MobileHeader.tsx` | `resolveMobileHeader()` ← GNB_ITEMS + SPECIAL_PAGES |
| 모바일 메뉴(Drawer) | `Header/Drawer.tsx` + `MobileNavigation.tsx` | `GNB_ITEMS` (동일) |
| Hero 제목·부제 | `Hero/Hero.tsx` | `resolveHeroMeta()` ← HERO_META + GNB_ITEMS |
| Breadcrumb | `Hero/Breadcrumb.tsx` | `resolveBreadcrumbSegments()` ← GNB_ITEMS만 |
| 하단 탭 | `BottomNav/BottomNav.tsx` | `BOTTOM_NAV_ITEMS` |
| 카테고리 형제 탭 | (호출처별) | `resolveSiblingTabs()` ← GNB_ITEMS |

데이터는 대부분 `GNB_ITEMS` 한 곳으로 모이지만 **Hero만 별도 메타(`HERO_META`)를 추가로 본다**. Breadcrumb은 GNB만 보므로, Hero에서만 정의된 라벨은 Breadcrumb에 등장할 수 없다.

### Admin

| 채널 | 컴포넌트 | 데이터 소스 |
| --- | --- | --- |
| 사이드바 | `AdminSidebar/index.tsx` | `ADMIN_NAV_SECTIONS` (adminNavigation.ts:21) |
| 헤더 Breadcrumb | `AdminHeader/index.tsx` | `resolveAdminBreadcrumbs(pathname, dynamicLabel)` (if-체인) |
| 동적 라벨 | `AdminLayout/index.tsx` | `useAdminBreadcrumbStore` (zustand) |

사이드바와 Breadcrumb이 같은 파일에 살지만 **상수와 함수가 서로 참조하지 않는다**. 라우트를 추가하면 두 곳을 모두 손대야 동기화된다.

---

## 2. 발견된 문제

### P1. 카테고리 페이지가 GNB에서 누락된다 — 영향: 큼

`GNB_ITEMS`에서 "다음세대", "교제", "교회 소식"의 `href`는 카테고리(`/next-gen`)가 아니라 **첫 자식 경로**(`/next-gen/kindergarten`)다.

```ts
// src/config/navigation.ts:32
{
  label: '다음세대',
  href: '/next-gen/kindergarten',  // ← /next-gen 이 아님
  children: [...]
}
```

`isActiveGnb`는 `pathname.startsWith(item.href)`로 판정한다. 사용자가 `/next-gen`을 방문하면 `'/next-gen'.startsWith('/next-gen/kindergarten')`은 `false`. children도 모두 더 깊은 경로라 매칭 실패. 결과:

| 채널 | 동작 |
| --- | --- |
| Header GNB | 어떤 항목도 활성 안 됨 |
| Drawer | 펼침/활성 안 됨 |
| Breadcrumb | `segments=[]` → 통째로 사라짐 (홈도 안 보임) |
| MobileHeader | fallback "대구동남교회" + showBack=true (홈이 아닌데 뒤로가기만 보이는 어색함) |
| Hero | HERO_META direct match로 정상 |
| BottomNav | `/community`·`/news`는 카테고리 매칭 성공, `/next-gen`은 BottomNav 자체에 없어 미매칭 |

같은 증상이 `/community`, `/news`에서도 발생한다. 카테고리 hub 페이지는 살아 있는데 페이지 외부의 모든 네비 컨텍스트가 무너진다.

**왜 이렇게 됐나(추정)**: 카테고리 페이지가 만들어지기 전 첫 자식으로 직링크하던 흔적. 카테고리 hub이 추가됐는데 GNB가 따라오지 못했다.

### P2. GNB와 Hero Meta가 따로 산다 — 영향: 큼

```ts
// src/components/layout/Hero/hero.config.ts:15
'/sermons/all':    { title: '전체 설교',   subtitle: '대구동남교회의 모든 설교를 검색·필터로 찾아보세요', eyebrow: 'ALL SERMONS' },
'/sermons/series': { title: '모든 시리즈', subtitle: '대구동남교회 강해 설교 시리즈 목록',             eyebrow: 'SERMON SERIES' },
```

이 두 경로는 `GNB_ITEMS`에 없다. `/sermons/all`을 방문하면:

- Hero: "전체 설교" (HERO_META direct match)
- Breadcrumb: `isActiveGnb`가 `/sermons`로만 매칭되어 "홈 > 설교"에서 끝남. 자식 라벨 없음.
- Header/Drawer: "설교"만 활성, 하위 드롭다운 없음

사용자는 Hero에서 "전체 설교"를 보지만 Breadcrumb은 "설교"에서 끝난다. 두 줄이 같은 페이지를 다른 이름으로 부른다.

또한 `resolveHeroMeta`의 direct-match 우선 규칙은 hero.config.ts:28-30 주석으로만 표시돼 있어, GNB에 `/sermons/all`을 자식으로 추가하면 동작이 슬쩍 바뀌는 함정이 있다.

### P3. 페이지가 있는데 메뉴에서 접근 불가 — 영향: 중간

| 경로 | page.tsx | 메뉴 노출 | 추정 |
| --- | --- | --- | --- |
| `/about/serving-people` | ✓ | GNB·Drawer·Breadcrumb 모두 없음 | 미공개? 페이지 폐기? |
| `/fellowship` | ✓ | 어느 채널에도 없음 (완전 고아) | 미사용? 제거 후보? |
| `/news/bulletins/create` | ✓ | 없음 | 관리자 전용을 `(content)`에 잘못 둔 듯 |
| `/news/bulletins/[id]/update` | ✓ | 없음 | 동일 |

URL을 직접 입력하지 않으면 도달할 수 없다. `/fellowship`은 어떤 컴포넌트에서도 참조하지 않아 빌드에서 dead code 검출도 안 된다(라우트는 디렉토리만으로 살아남기 때문).

### P4. BottomNav 라벨이 GNB와 어긋난다 — 영향: 작음

```ts
// src/config/navigation.ts:62
export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { label: '홈',   href: '/',                  icon: 'home'  },
  { label: '설교', href: '/sermons',           icon: 'book'  },
  { label: '소식', href: '/news/notices',      icon: 'file'  },   // ← GNB는 "교회 소식"
  { label: '교제', href: '/community/prayer',  icon: 'users' },
  { label: '전체', href: '/menu',              icon: 'menu'  },   // ← /menu page.tsx 미존재
];
```

- "교회 소식"(GNB) ↔ "소식"(BottomNav) — 같은 카테고리를 두 이름으로 부른다.
- "다음세대"·"교회 소개"는 BottomNav에 없음. 의도된 축약일 수 있지만 SSOT 분리 자체는 별 효익 없이 유지 비용만 늘린다.
- "전체"가 가리키는 `/menu`는 `page.tsx`가 없다(글롭 결과: `src/app/**/menu/page.tsx` 0건). 클릭 시 not-found.

### P5. Admin Breadcrumb은 링크가 아닌 string[] — 영향: 중간

```ts
// src/components/admin/layout/AdminHeader/index.tsx:7
interface AdminHeaderProps {
  crumbs: string[];   // ← public은 {label, href}[]
}
```

```tsx
// AdminHeader/index.tsx:35
<span className={clsx(styles.crumb, last && styles.current)}
      aria-current={last ? 'page' : undefined}>
  {crumb}
</span>
```

- "관리자 > 설교 관리 > 새 설교 등록"에서 "설교 관리"를 클릭해 상위로 못 돌아간다.
- 키보드 사용자는 Breadcrumb으로 이동할 수 없다.
- 같은 앱에 Breadcrumb 두 종류가 공존하는 비대칭.

### P6. Admin 사이드바 4개 항목이 빈 페이지 — 영향: 큼

```ts
// src/config/adminNavigation.ts:21
ADMIN_NAV_SECTIONS = [
  { items: [{ label: '설교 관리',   href: '/admin/sermons',         badge: '128' }] }, // ✓ 실재
  { items: [{ label: '시리즈 관리', href: '/admin/sermons/series',  badge: '24'  }] }, // ✗ page.tsx 없음
  { items: [{ label: '설교자 관리', href: '/admin/sermons/speakers'                }] }, // ✗ 없음
  { items: [{ label: '멤버 관리',   href: '/admin/members'                          }] }, // ✗ 없음
  { items: [{ label: '설정',        href: '/admin/settings'                         }] }, // ✗ 없음
];
```

실제 admin page.tsx는 4개: `/admin`, `/admin/sermons`, `/admin/sermons/new`, `/admin/sermons/[id]/edit`. 사이드바 5개 노출 중 1개만 살아 있다. badge `128`·`24`도 하드코딩 가짜 숫자.

`resolveAdminBreadcrumbs`는 이미 죽은 경로에 대한 분기까지 친절하게 가지고 있다(`/admin/sermons/series`, `/admin/sermons/speakers`). 메뉴를 "예고편"으로 두려는 의도라면 명시적으로 비활성화하고 "준비 중" 라벨을 붙이는 게 맞다.

### P7. Admin Breadcrumb이 if-체인 — 영향: 중간

```ts
// src/config/adminNavigation.ts:62
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
```

라우트가 늘면 분기도 늘고, 사이드바 정의와 이중으로 동기화해야 한다. 빠뜨리면 fallback `['관리자']`만 보여 디버깅이 모호하다. `===` 와 `startsWith`가 섞여 있어 규칙 자체도 일관성이 없다.

### P8. `SPECIAL_PAGES`는 MobileHeader만 인식 — 영향: 작음

```ts
// src/config/navigation.ts:124
const SPECIAL_PAGES: Record<string, string> = {
  '/mypage': '마이페이지',
  '/search': '검색',
  '/notifications': '알림',
  '/login': '로그인',
  '/sign-up': '회원가입',
};
```

`/search`·`/notifications`는 `(content)` 그룹 안에 있어 Hero·Breadcrumb 슬롯이 노출되지만, 둘 다 GNB·HERO_META 미등록 → Hero=null, Breadcrumb=[] → 표시 안 됨. 데스크톱에서는 헤더 아이콘으로만 진입한다(GNB에 라벨 없음). 모바일에서만 페이지 제목이 보이는 비대칭.

### P9. Public Breadcrumb의 "홈" 하드코딩 — 영향: 매우 작음

```tsx
// src/components/layout/Hero/Breadcrumb.tsx:35
<Link href="/" className={styles.breadcrumb_link}>홈</Link>
```

홈 라벨이 JSX에 박혀 있다. 자체로는 작지만 SSOT 통합 시 같이 정리할 자국.

### P10. `resolveHeroMeta`의 direct-match 우선이 표면화되지 않는다 — 영향: 매우 작음

```ts
// src/components/layout/Hero/hero.config.ts:31
const direct = HERO_META[pathname];
if (direct) return direct;
```

`/sermons/all` 같은 경로가 GNB에 추가될 때 HERO_META 우선 동작이 슬쩍 바뀌는 함정. 주석에는 적혀 있지만 호출처에서는 보이지 않는다.

---

## 3. 라우트 매트릭스

`G`=Header/Drawer GNB 활성, `B`=Breadcrumb 표시 정확, `H`=Hero 표시, `Bn`=BottomNav 활성, `Mh`=MobileHeader 정확 라벨. `−`=동작 없음(의도된 비노출), `△`=어긋남, `✗`=문제.

| 라우트 | page.tsx | G | B | H | Bn | Mh |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | ✓ | − | − | − | ✓ "홈" | ✓ "대구동남교회" |
| `/about` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/about/pastor` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/about/vision` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/about/worship` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/about/location` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/about/welcome` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/about/serving-people` | ✓ | **✗** | △ "교회 소개"만 | **✗** | − | ✓ "교회 소개" |
| `/next-gen` | ✓ | **✗** | **✗** | ✓ | − | △ fallback |
| `/next-gen/kindergarten` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/next-gen/elementary` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/next-gen/youth` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/next-gen/young-adult` | ✓ | ✓ | ✓ | ✓ | − | ✓ |
| `/sermons` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/sermons/all` | ✓ | △ "설교" | △ "설교"만 | ✓ "전체 설교" | ✓ | ✓ "설교" |
| `/sermons/series` | ✓ | △ "설교" | △ "설교"만 | ✓ "모든 시리즈" | ✓ | ✓ "설교" |
| `/sermons/[id]` | ✓ | △ "설교" | △ "설교"만 | **✗** | ✓ | ✓ |
| `/sermons/series/[id]` | ✓ | △ "설교" | △ "설교"만 | **✗** | ✓ | ✓ |
| `/community` | ✓ | **✗** | **✗** | ✓ "교제" | ✓ | △ fallback |
| `/community/prayer` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/community/sharing` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/community/groups` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/news` | ✓ | **✗** | **✗** | ✓ "교회 소식" | ✓ | △ fallback |
| `/news/notices` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/news/bulletins` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/news/bulletins/create` | ✓ | △ "교회 소식 > 주보" | △ | **✗** | ✓ | ✓ |
| `/news/bulletins/[id]/update` | ✓ | △ | △ | **✗** | ✓ | ✓ |
| `/news/gallery` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| `/fellowship` | ✓ | **✗** | **✗** | **✗** | **✗** | △ fallback |
| `/notifications` | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ (모바일만) |
| `/search` | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ (모바일만) |
| `/menu` | **✗** | ✗ | ✗ | ✗ | ✓ "전체" → 404 | − |

Admin:

| 라우트 | page.tsx | Sidebar | Breadcrumb |
| --- | --- | --- | --- |
| `/admin` | ✓ | ✓ "대시보드" | ✓ |
| `/admin/sermons` | ✓ | ✓ | ✓ |
| `/admin/sermons/new` | ✓ | △ "설교 관리" 활성 | ✓ |
| `/admin/sermons/[id]/edit` | ✓ | △ "설교 관리" 활성 | ✓ (동적 라벨, store 주입) |
| `/admin/sermons/series` | **✗** | ✓ (badge "24") | ✓ → 404 |
| `/admin/sermons/speakers` | **✗** | ✓ | ✓ → 404 |
| `/admin/members` | **✗** | ✓ | ✓ → 404 |
| `/admin/settings` | **✗** | ✓ | ✓ → 404 |

---

## 4. 개선안

세 가지 옵션을 단계적으로 쌓을 수 있도록 정리한다.

### 옵션 A — 미니멀 패치 (사실 정정만)

**범위**: 메뉴 정의의 사실 오류만 수정. 추상화 변경 없음.

1. `GNB_ITEMS` 카테고리 href를 카테고리 경로로 바꾼다.
   ```ts
   { label: '다음세대',   href: '/next-gen',   children: [...] }
   { label: '교제',       href: '/community',  children: [...] }
   { label: '교회 소식',  href: '/news',       children: [...] }
   ```
   카테고리 페이지가 진짜 컨텐츠를 가질 때만 적용한다. 자식 첫 페이지로 보내고 싶다면 카테고리 `page.tsx` 안에서 `redirect()`로 처리하는 게 더 명확하다 — 메뉴 정의가 사용자 동선을 책임지지 않게.

2. `/sermons/all`·`/sermons/series`를 GNB 자식으로 노출한다.
   ```ts
   { label: '설교', href: '/sermons',
     children: [
       { label: '전체 설교', href: '/sermons/all'    },
       { label: '시리즈',    href: '/sermons/series' },
     ] }
   ```
   그러면 `HERO_META` direct 분기가 필요 없고, `/sermons/all`에서 Hero·Breadcrumb·Drawer가 일치한다.

3. `BOTTOM_NAV_ITEMS`의 "소식" → "교회 소식"으로 라벨 통일. `/menu`는 사이트맵 페이지를 만들거나 BottomNav 항목 자체를 제거(또는 Drawer 토글로 대체).

4. Admin 사이드바에서 page.tsx 없는 4개 항목은 명시적으로 `comingSoon: true` 플래그(또는 별도 섹션 "준비 중")로 분리하고 클릭 비활성화. 가짜 badge 제거. `resolveAdminBreadcrumbs`의 죽은 분기도 같이 정리.

5. 고아 페이지 정리:
   - `/fellowship`: 의도 확인 후 삭제 또는 GNB 추가.
   - `/about/serving-people`: GNB 자식으로 노출 또는 디렉토리 삭제.
   - `/news/bulletins/create`·`/news/bulletins/[id]/update`: `(admin)` 그룹으로 이동(주보 관리 어드민 화면). public 디렉토리에 남기지 않는다.

**장점**: 모든 변경이 데이터 한 줄~수 줄 수준. 다른 컴포넌트에 영향 없음. 사용자에게 보이는 P1·P2·P4·P6·P8을 즉시 해결.
**단점**: 구조 문제(SSOT 2종, Admin string Breadcrumb, if-체인)는 그대로 남는다.
**위험**: 카테고리 href를 바꾸면 `isActiveGnb` 활성 판정이 달라진다. 회귀 테스트 또는 매트릭스 기반 수동 체크리스트가 필요.
**예상 분량**: 단일 PR, 변경 LOC 50~80 수준.

### 옵션 B — 단일 매니페스트로 통합 (`SITE_MAP`)

**범위**: `GNB_ITEMS`·`HERO_META`·`BOTTOM_NAV_ITEMS`·`SPECIAL_PAGES`를 하나의 트리로 합친다. Admin도 동일 구조로 마이그레이션.

```ts
// src/config/sitemap.ts (개념 스케치)
type Channel = 'gnb' | 'drawer' | 'bottomNav' | 'breadcrumb' | 'hero';

type RouteNode = {
  path: string;
  label: string;                                      // 모든 채널 공통
  hero?: { subtitle: string; eyebrow?: string };
  channels: Channel[];
  children?: RouteNode[];
  meta?: {
    hidden?: boolean;           // 페이지는 있지만 메뉴 비노출
    comingSoon?: boolean;       // 메뉴 노출, 클릭 비활성
    dynamicLabel?: true;        // 런타임 store 라벨 주입
    icon?: string;              // BottomNav/Admin sidebar용
  };
};

export const SITE_MAP: RouteNode = {
  path: '/',
  label: '홈',
  channels: ['breadcrumb', 'bottomNav'],
  meta: { icon: 'home' },
  children: [
    {
      path: '/about',
      label: '교회 소개',
      hero: { subtitle: '대구동남교회를 소개합니다', eyebrow: 'ABOUT' },
      channels: ['gnb', 'drawer', 'breadcrumb', 'hero'],
      children: [
        { path: '/about/pastor',   label: '인사말',       channels: ['gnb', 'drawer', 'breadcrumb', 'hero'] },
        { path: '/about/vision',   label: '교회의 비전',  channels: ['gnb', 'drawer', 'breadcrumb', 'hero'] },
        // ...
      ],
    },
    // ...
  ],
};
```

소비처는 트리에 대한 셀렉터 호출만 한다.

```ts
getGnbItems()                  // channels.includes('gnb') 필터링
getBottomNavItems()            // channels.includes('bottomNav') 필터링
resolveBreadcrumbSegments(p)   // path-prefix 매칭으로 조상 노드 수집
resolveHeroMeta(p)             // 같은 트리에서 label + hero
getMobileHeaderTitle(p)        // 같은 트리에서 라벨 + showBack
```

Admin도 같은 매니페스트(또는 `SITE_MAP.children` 안의 `/admin` 서브트리)로 이식. `AdminHeader`가 `{label, href}[]`를 받도록 시그니처 변경 → public Breadcrumb 컴포넌트와 통합 가능.

**장점**:
- 새 라우트 추가가 한 곳: `channels` 배열 한 줄.
- Hero 제목과 Breadcrumb 끝 라벨이 같은 노드의 `label`에서 나오므로 강제로 일치.
- 매트릭스를 코드에서 직접 생성할 수 있어 회귀 테스트 자료가 자동으로 만들어짐.
- Admin/Public Breadcrumb의 자료형이 통일 → 컴포넌트도 통합 가능.

**단점**:
- 1회 마이그레이션 비용: 모든 채널 컴포넌트를 셀렉터 API로 갈아끼움. 예상 LOC 300~500.
- 트리 vs 평면 표현의 trade-off. 자식이 다채널에 노출될 때 `channels` 배열이 길어진다.
- 동적 라벨 처리는 결국 store(또는 콜백)로 분리해야 함 — 현재 `useAdminBreadcrumbStore` 패턴은 유지.

**위험**:
- 동시에 모든 화면이 영향. 단계적 적용이 어려움. 매트릭스 회귀를 사전에 도구화하지 않으면 손으로 잡기 어렵다.
- `resolveHeroMeta`의 direct-match 우선 같은 미묘한 동작이 사라지므로 의존 페이지(예: `/sermons/all` Hero) 확인 필수.

**예상 분량**: 1~2 PR. 1) 매니페스트 정의 + 셀렉터 + public 마이그레이션, 2) admin 마이그레이션 + AdminHeader 시그니처 변경.

### 옵션 C — 페이지 콜로케이션 (메타데이터 export + 빌드 수집)

**범위**: 각 `page.tsx`가 `navMeta`를 export하고, 빌드 시 라우트 매니페스트를 자동 생성.

```tsx
// app/(content)/sermons/all/page.tsx
export const navMeta = {
  label: '전체 설교',
  parent: '/sermons',
  hero: { subtitle: '대구동남교회의 모든 설교를 검색·필터로 찾아보세요', eyebrow: 'ALL SERMONS' },
  channels: ['gnb', 'drawer', 'breadcrumb', 'hero'],
};
```

빌드 스크립트가 모든 page에서 `navMeta`를 수집해 `src/generated/sitemap.ts`를 생성. 런타임에서는 옵션 B와 같은 셀렉터로 소비.

**장점**:
- 페이지와 라벨이 같은 디렉토리. 페이지 추가/이동 시 메타도 자연스럽게 함께 이동.
- 라벨 누락이 "page 자체 누락"과 같은 결로 발견됨 — IDE/grep 친화적.
- 옵션 B의 모든 효익을 가지면서 매니페스트 유지비 감소.

**단점**:
- 빌드 단계 추가(수집 스크립트 + watch). Next App Router에서 page export를 빌드 타임에 끌어오는 게 만만치 않음(클라이언트 컴포넌트의 직렬화 제약).
- 동적 라벨(`/admin/sermons/[id]/edit`)은 결국 store 위임 → 옵션 B와 같은 그림.
- 트리 관계(부모-자식)는 path 문자열로 추론해야 하므로, 명시적 트리 정의보다 추적이 흐려질 수 있음.

**위험**:
- 빌드 파이프라인 신설 비용이 현재 프로젝트 규모(라우트 ~35개) 대비 과함.
- 셀렉터 동작은 옵션 B와 같지만 디버깅 시 "이 라벨이 어디서 왔는지" 추적 깊이가 한 단계 늘어남.

**예상 분량**: 옵션 B의 1.5~2배. 빌드 스크립트, 타입 가드, watch 통합까지 포함.

### 옵션 비교

| 항목 | A 미니멀 | B 단일 매니페스트 | C 페이지 콜로케이션 |
| --- | --- | --- | --- |
| 변경 규모 | 작음 (50~80 LOC) | 큼 (300~500 LOC) | 매우 큼 (빌드 파이프라인 신설) |
| P1 해결 | ✓ | ✓ | ✓ |
| P2 해결 | ✓ | ✓ (강제 동기) | ✓ |
| P3 (고아 페이지) | 수동 결정 | 매니페스트가 강제 가시화 | page 부재가 자동 검출 |
| P4 (BottomNav 라벨) | ✓ | ✓ (자동 동기) | ✓ |
| P5 (Admin Breadcrumb 링크) | 미해결 | ✓ | ✓ |
| P6 (admin 빈 페이지) | 플래그 | `meta.comingSoon` | page 부재 자체로 비노출 |
| P7 (admin if-체인) | 미해결 | ✓ | ✓ |
| 즉시 적용 가능성 | ✓ | △ (PR 1~2주) | ✗ |
| 회귀 위험 | 낮음 | 중간 | 중상 |
| 후속 관리 비용 | 변동 없음 | 낮음 (한 곳 수정) | 낮음 (페이지 옆 수정) |

### 권장 경로

1. **이번 PR(옵션 A)** — 사용자 보이는 P1·P2·P4·P8 우선 해결. `exec-plan` 단일 작업으로 처리 가능한 크기. 매트릭스 표(§3)를 회귀 체크리스트로 활용.
2. **다음 PR(매트릭스 회귀 도구)** — `src/__tests__/sitemap.matrix.test.ts`로 라우트별 G/B/H/Bn/Mh 기대값을 코드 표로 명시. 단일 함수 호출로 navigation.ts·hero.config.ts의 출력을 검증. 옵션 B 진입 전 안전망.
3. **분기 단위(옵션 B)** — 매트릭스 회귀가 잡힌 상태에서 단일 매니페스트로 점진 마이그레이션. AdminHeader 시그니처 변경(P5·P7) 동반.
4. **옵션 C 보류** — 라우트가 70~80개를 넘어 매니페스트 유지가 부담스러워지면 재고. 현 시점에서는 도입 비용 과함.

---

## 5. 후속 작업 / 결정 필요

| 항목 | 종류 | 메모 |
| --- | --- | --- |
| `/fellowship` 처리 결정 | 결정 | 삭제 vs GNB 추가. 컨텐츠 기획 합의 필요 |
| `/about/serving-people` 처리 결정 | 결정 | 동일 |
| `/news/bulletins/create`·`/update` 이동 | 작업 | `(admin)` 그룹으로 이동, GNB·Breadcrumb에서 제거 |
| `/menu` 페이지 작성 또는 BottomNav 항목 변경 | 결정 | 사이트맵 페이지 vs Drawer 토글로 대체 |
| Admin 사이드바 4개 항목 정책 | 결정 | 숨기기 vs "준비 중" 노출 |
| `resolveAdminBreadcrumbs` if-체인 → 데이터 | 리팩터 | 옵션 B 합류 시 자연 해소 |
| 옵션 A 적용 exec-plan | 작업 | `node scripts/start-task.mjs sitemap-consistency-fix` |
| 매트릭스 회귀 도구 | 작업 | 옵션 B 진입 전 선행 |

---

## 부록: 핵심 파일 경로

- `src/config/navigation.ts` — `GNB_ITEMS`, `BOTTOM_NAV_ITEMS`, `SPECIAL_PAGES`, 라벨 해석 함수들
- `src/config/adminNavigation.ts` — `ADMIN_NAV_SECTIONS`, `resolveAdminBreadcrumbs`
- `src/components/layout/Hero/hero.config.ts` — `HERO_META`, `resolveHeroMeta`
- `src/store/admin-breadcrumb.store.ts` — 동적 라벨 store
- `src/components/layout/Header/{DesktopHeader,MobileHeader,Drawer,MobileNavigation}.tsx`
- `src/components/layout/Hero/{Hero,Breadcrumb}.tsx`
- `src/components/layout/BottomNav/BottomNav.tsx`
- `src/components/admin/layout/{AdminHeader,AdminSidebar,AdminLayout}/index.tsx`
