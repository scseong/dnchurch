---
name: file-structure
description: 새 파일/컴포넌트 생성, 파일 위치 결정, 디렉토리 구조 변경, barrel export(index.ts) 작업 시 사용
---

# 디렉토리 구조 · 파일 배치 기준

## 디렉토리 구조 요약

```
src/
├── app/
│   ├── _component/          # 루트 페이지 전용 컴포넌트 (home, auth, user)
│   ├── (with-navbar)/       # 네비게이션 바 포함 라우트 그룹
│   │   └── [route]/
│   │       ├── _component/  # 해당 페이지 전용 컴포넌트
│   │       └── page.tsx
│   ├── (without-navbar)/    # 네비게이션 바 제외 라우트 그룹
│   ├── layout.tsx
│   └── page.tsx
├── actions/                 # Server Actions (폼 제출·뮤테이션 전담)
├── apis/                    # DB 쿼리 함수 (단일 테이블, 순수 fetch)
├── components/              # 앱 전역 공유 컴포넌트
│   ├── board/               # 게시판 레이아웃 (BoardHeader, BoardBody, …)
│   ├── common/              # 범용 UI (Modal, Loader, CloudinaryImage, …)
│   ├── file/                # 파일 업로드 관련 (FileSelector, ImageUpload, …)
│   ├── form/                # 폼 공통 요소 (FormField, FormSubmitButton, …)
│   ├── layout/              # 레이아웃 크롬 (Header, Footer, LayoutContainer, …)
│   └── lib/                 # 서드파티 래퍼 (KakaoScript)
├── constants/               # 상수값 (도메인별 파일로 분리)
├── context/                 # React Context Provider
├── hooks/                   # 커스텀 훅
├── lib/supabase/            # Supabase 클라이언트 팩토리
├── services/                # 비즈니스 로직 (여러 쿼리 조합·가공)
├── styles/                  # 전역 스타일 및 디자인 토큰
├── types/                   # TypeScript 타입 정의
└── utils/                   # 순수 유틸리티 함수
```

## 새 파일을 어디에 둘 것인가

### 컴포넌트

| 상황 | 위치 |
|---|---|
| 특정 페이지에서만 사용 | `app/[route]/_component/` |
| 루트 페이지(`/`) 전용 | `app/_component/home/` |
| 인증 페이지 전용 | `app/_component/auth/` |
| 여러 페이지에서 재사용 | `src/components/[domain]/` |
| 레이아웃 크롬 (Header, Footer 등) | `src/components/layout/` |
| 게시판 공통 레이아웃 | `src/components/board/` |
| 범용 UI (버튼, 모달 등) | `src/components/common/` |

> 한 페이지에서만 쓰이는 컴포넌트를 `src/components/`에 두지 않는다. 재사용 가능성이 확인된 시점에 이동한다.

### 유틸·훅·상수·타입

| 파일 종류 | 위치 | 기준 |
|---|---|---|
| 순수 유틸 함수 | `src/utils/[domain].ts` | 특정 프레임워크 의존 없음, 입력→출력 변환 |
| 커스텀 훅 | `src/hooks/use[Name].tsx` | React 훅 규칙 준수, 재사용 가능 |
| 상수 | `src/constants/[domain].ts` | 도메인별로 파일 분리, `index.ts`로 공통 상수만 re-export |
| TypeScript 타입 | `src/types/[domain].ts` | DB 파생 타입은 `database.types.ts` 참조 |
| Server Action | `src/actions/[domain].action.ts` | 뮤테이션 전담, `createServerSideClient()` 고정 |
| DB 쿼리 | `src/apis/[domain].ts` | 단일 테이블 쿼리, 캐시 전략 포함 |
| 비즈니스 로직 | `src/services/[domain]/` | 여러 쿼리 조합, 결과 가공 |

### 컴포넌트와 같은 폴더에 두는 파일

| 파일 | 위치 |
|---|---|
| SCSS Module | 컴포넌트와 동일 디렉토리 (`ComponentName.module.scss`) |
| 타입·인터페이스 (해당 컴포넌트 전용) | 컴포넌트 파일 내 inline 정의 |

## `index.ts` barrel export 규칙

디렉토리에 컴포넌트가 2개 이상이고 외부에서 import할 때 `index.ts`를 생성한다.

```ts
// src/app/_component/home/index.ts
export { default as Banner } from './Banner';
export { default as QuickAccess } from './QuickAccess';
```

단일 파일만 있는 경우 `index.ts` 없이 직접 import한다.

## 파일이 많아질 때

같은 도메인 컴포넌트가 `_component/` 내에 과도하게 늘어나면 서브디렉토리로 분리한다.

```
_component/
├── table/           # 테이블 관련 컴포넌트 묶음
│   ├── CategoryBadge.tsx
│   ├── PinIcon.tsx
│   └── index.ts
└── NoticeTable.tsx
```
