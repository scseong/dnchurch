---
name: ui-components
description: Button·TextField·Textarea·Modal·BottomSheet·Tabs·Label·Pill·ListItem·Pagination·Skeleton·EmptyState 등 공용 UI 컴포넌트 사용·확장·신규 추가 시 사용. 폼·다이얼로그·탭·뱃지·로딩·빈 상태 작업이 트리거.
---

# 공용 UI 컴포넌트 시스템

## 핵심 원칙

UI 작업은 **`@/components/ui` 우선**이다. raw `<button>`/`<input>`/`<dialog>`을 직접 작성하기 전에 공용 컴포넌트가 있는지 먼저 확인한다.

```ts
// ✅ 신규 코드는 barrel 사용
import { Button, TextField, Modal, Label } from '@/components/ui';

// ⚠️ 기존 경로(@/components/ui/Button/Button)도 호환되지만 신규 코드에는 barrel 권장
```

상세 카탈로그는 `src/components/ui/README.md` 참조. 토큰/믹스인은 `.claude/skills/styles/SKILL.md`.

## 컴포넌트 12종 — 빠른 매칭

| 의도 | 사용 |
|---|---|
| 액션 트리거 | **Button** (`variant`: primary/secondary/ghost/danger) |
| 단일 줄 입력 | **TextField** |
| 멀티라인 입력 | **Textarea** (`autoGrow`/`showCounter`) |
| PC 우선 다이얼로그·확인창 | **Modal** (`size`: sm/md/lg, `role`: dialog/alertdialog) |
| 모바일 시트 / select 대체 | **BottomSheet** |
| 탭 네비게이션 | **Tabs** (`variant`: underline/pill, `fitted` 옵션) |
| URL 기반 페이지네이션 | **Pagination** |
| 정보성 라벨(비인터랙티브) | **Label** (분류·상태·NEW 표시) |
| 인터랙티브 칩 | **Pill** (필터·태그·해제) |
| 리스트 행 | **ListItem** (Link/button 자동) |
| 로딩 placeholder | **Skeleton** |
| 빈 상태 | **EmptyState** |

## 선택 가이드 (헷갈리는 짝)

| 상황 | 선택 |
|---|---|
| 정보 표시 (분류·상태) — 클릭 X | **Label** (`<span>`) |
| 클릭/해제 가능 (필터·태그) | **Pill** (`<button>` 또는 close 포함 `<span>`) |
| PC 폼·확인 다이얼로그 | **Modal** |
| 모바일 select / dropdown 대체 | **BottomSheet** |
| 단일 줄 입력 | **TextField** |
| 멀티라인 또는 글자 수 카운터 | **Textarea** |

Modal과 BottomSheet는 같은 슬롯 API(`title`/`footer`/`showClose`)라 상호 변환이 쉽다.

## 금지 패턴

> **범위**: 앱·도메인 코드(`src/app/**`, `src/components/**` 중 ui 외)에서 직접 작성 금지. ui 디렉토리 내부 컴포넌트 구현(예: Pill의 `<button>`, ListItem의 Link/button 분기)은 정상.

| 금지 | 이유 | 대안 |
|---|---|---|
| `<button>` 또는 raw `<input type="text">` 직접 작성 | 토큰·a11y·hover 패턴 우회 | **Button** / **TextField** |
| 새 모달·시트를 `<dialog>` 또는 portal로 직접 구현 | focus trap·scroll lock·inert 누락 | **Modal** / **BottomSheet** |
| `useState`로 자작 탭 상태 + `<div>` 탭 마크업 | a11y(role=tab/tabpanel) 누락 | **Tabs** |
| 색깔 칩을 `<span style={{ color }}>`로 자작 | 토큰 무시 | **Label** (variant 6종) |
| `field-sizing` 또는 `<textarea rows>` 직접 자동 확장 시도 | Textarea가 이미 `autoGrow` 지원 | **Textarea** `autoGrow` |

예외: ui 카탈로그가 다루지 못하는 도메인 특화 UI(예: 커뮤니티 댓글 트리)는 자작 가능. 다만 내부 액션·입력은 ui 컴포넌트로 채운다.

## 신규 공용 컴포넌트 추가 절차

새 UI를 ui로 승격하려면 다음을 만족한다.

1. **재사용 확인**: 같은 패턴이 2곳 이상에서 필요해진 시점에만. 1곳만 쓰면 `app/[route]/_component/`에 둔다.
2. **파일 배치**: `src/components/ui/<Name>/<Name>.tsx` + 같은 디렉토리에 `<Name>.module.scss`.
3. **토큰만 사용**: 하드코딩 금지. `.claude/skills/styles/SKILL.md`의 시맨틱 토큰 + 믹스인 적용.
4. **barrel 등록**: `src/components/ui/index.ts`에 named export 추가. 타입은 `export type {...}` 별도 줄.
5. **README 갱신**: `src/components/ui/README.md` 컴포넌트 표·선택 가이드에 한 줄 추가.
6. **JSDoc**: 사용 예시 + 주요 props 설명. 기존 컴포넌트의 JSDoc 톤을 따른다.
7. **a11y 체크리스트**: 키보드(Tab/Enter/Esc), 포커스 표시, ARIA 라벨/role 검토. 다이얼로그류는 `useDialog` 훅 위임.
8. **기능·시각 수기 검증**: 사용처 1곳 이상에 적용해 키보드·hover·responsive(모바일/PC) 시나리오 확인. 테스트 환경이 없으므로 PR 본문에 적용 전후 스크린샷 첨부.

## 기존 컴포넌트 수정 시

- props 추가는 OK — 기존 콜러 영향 없는 선택적 prop으로.
- 시그니처 파괴(prop 이름 변경, 필수화)는 ADR 후보. 영향 범위(`grep -r '<Button' src/`)부터 산출.
- 스타일은 module.scss에서만 — 콜러 측 인라인 override 금지.
- a11y 동작(focus trap, inert 등) 변경 시 Codex 1차 검증 필수.

## 자주 가는 곳

| 상황 | 파일 |
|---|---|
| 카탈로그·선택 가이드 | `src/components/ui/README.md` |
| 토큰·믹스인·hover 3원칙 | `.claude/skills/styles/SKILL.md` |
| 다이얼로그 공통 동작(focus trap·ESC·inert) | `src/hooks/useDialog.ts` |
| 디자인 시스템 v3 토큰 결정 | `docs/decisions/0003-design-system-v3-token-unification.md` |
| 컴포넌트 기반 결정 | `docs/decisions/0004-ui-component-foundation.md` |
