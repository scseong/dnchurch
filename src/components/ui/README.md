# UI Components

Codeit 디자인 시스템 기반 공용 컴포넌트.

## Import

```ts
import { Button, TextField, Modal, Label } from '@/components/ui';
```

기존 경로(`@/components/ui/Button/Button`)도 호환되지만 신규 코드는 barrel 경로를 권장합니다.

---

## 컴포넌트 목록

| 컴포넌트 | 용도 | 핵심 prop |
|---|---|---|
| **Button** | 액션 트리거 | `variant`(primary/secondary/ghost/danger), `size`(sm/md/lg), `leadingIcon`/`trailingIcon`, `fullWidth` |
| **TextField** | 단일 줄 입력 | `label`, `helper`/`error`/`success`, `leadingIcon`/`trailingSlot` |
| **Textarea** | 멀티라인 입력 | `label`, `error`/`success`, `showCounter` + `maxLength`, `autoGrow` |
| **Modal** | PC 우선 다이얼로그 | `open`, `title`, `size`(sm 32rem / md 48rem / lg 64rem), `role`(dialog/alertdialog), `footer` |
| **BottomSheet** | 모바일 시트 (PC ≥pc-sm 이상은 중앙 모달) | `open`, `title`, `showClose`, `footer` |
| **Tabs** | 탭 네비게이션 | `variant`(underline/pill), `size`, `items`(label/count/leadingIcon/panelId), `fitted` |
| **Pagination** | URL 기반 페이지 | `totalCount`, `currentPage`, `pageSize`, `maxVisiblePages` |
| **Label** | 정보성 라벨 (비인터랙티브) | `variant`(neutral/info/success/warning/danger/accent), `shape`, `size` |
| **Pill** | 인터랙티브 칩 | `active`, `closable`+`onClose` 또는 `onClick` (상호 배타) |
| **ListItem** | 리스트 행 (Link/button) | `href` 있으면 Link, 없으면 button. `selected`, `trailing` |
| **Skeleton** | 로딩 placeholder | `variant`(rect/text/circle), `width`/`height` |
| **EmptyState** | 빈 상태 | `title`, `description`, `icon`, `action`, `announce` |

---

## 사용 가이드

### Modal vs BottomSheet
- PC 우선 폼·확인 다이얼로그 → **Modal**
- 모바일 select / dropdown 대체 → **BottomSheet**
- 둘 다 같은 슬롯 API(title/footer/showClose) — 상호 변환 쉬움

### Label vs Pill
- 정보 표시 (분류·상태·NEW) → **Label** (비인터랙티브 `<span>`)
- 클릭/해제 가능 (필터·태그) → **Pill** (인터랙티브 `<button>` 또는 close 포함 `<span>`)

### TextField / Textarea 폰트 16px
- iOS auto-zoom 방지를 위해 16px 고정. **변경 금지.**
- 메시지 우선순위: `error` > `success` > `helper`

### Dialog (Modal/BottomSheet) a11y
- `useDialog` 훅 위임 — focus trap, Tab 순환, ESC 자동.
- `role="alertdialog"` 시 ESC 자동 비활성 (명시적 응답 강제).
- 닫힌 상태(`open=false`)는 `inert` 속성으로 SR/Tab 진입 차단.

### Tabs 키보드 네비
- Tab/Shift+Tab — 탭 사이 포커스 이동 (활성화는 Enter/Space)
- Arrow Left/Right — 순환 + 자동 활성화
- Home/End — 첫/마지막 + 자동 활성화

### Tokens
모든 컴포넌트는 `src/styles/tokens/` 시맨틱 토큰만 사용. 자세한 사용법은 각 컴포넌트의 JSDoc 참고.
