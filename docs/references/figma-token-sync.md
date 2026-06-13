# Figma ↔ 코드 토큰 동기화

ADR 0017(Figma-SoT 디자인투코드, Path Free)의 토큰 동기화 절차다. Style Dictionary·Tokens Studio가 하던 export를 figma-console MCP로 처리한다. 설정은 레포 루트 `tokens.config.json`, 피벗은 `docs/design-system/tokens.tokens.json`(DTCG).

## SoT(source of truth, 기준 원본) 경계 — Figma가 가진 것 vs 코드가 가진 것

디자인 레이어만 Figma가 기준이다. 행위·반응형·함수는 코드에만 정의한다.

| 구분 | 항목 | 위치 |
| --- | --- | --- |
| **Figma 소유 (174)** | 색 primitive 28(hex), 색 semantic 61(alias 32 + raw 29), spacing 30, radius 21, typography 34 | Figma 변수 → `docs/design-system/tokens.tokens.json` |
| **Figma 소유 (스타일 16)** | 텍스트 스타일 12 + 이펙트(그림자) 4 — 변수가 아닌 별도 스타일 | DTCG 미포함 → 아래 "텍스트·이펙트 스타일" 절 |
| **코드 전용** | 믹스인(`hover-bg-shift`·`text-card-title` 등), heading size 맵, `$responsive-font-vw-map`, `rgba()` 합성, breakpoint·z-index·container·고정 높이, semantic alias의 warm/cool 역할 | `src/styles/tokens/*`, `src/styles/_mixins.scss` |

Figma 변수로 표현되지 않는 것 (코드에서만 정의):

- 가로·세로 쌍을 한 토큰에 담는 `$padding-*`
- 투명도 합성 `rgba($navy-800, 0.06)`
- 미디어쿼리 분기

## 명령 (Claude + figma-console MCP, Figma 데스크톱 켜둔 상태)

```
# Figma → 코드 : DTCG 피벗 생성 (Path Free 기본)
figma_export_tokens                         # 무인자, tokens.config.json 읽어 docs/design-system/tokens.tokens.json 씀

# 드리프트 점검 : 값 비교만, 파일 안 씀
figma_export_tokens(strategy=dry-run, format=scss)   # 컬렉션별 토큰 수 + scss 미리보기

# 코드 → Figma : 값 변경만 자동 (후속)
figma_import_tokens(format=dtcg, dryRun=true)        # diff 미리보기 → dryRun=false로 적용
# 신규 토큰 추가는 figma_setup_design_tokens / figma_batch_create_variables (반자동)
```

## 제약

- figma-console 브리지는 Figma 데스크톱 + 플러그인이 켜져 있어야 동작한다(WebSocket port 9224). CI에서 자동으로 못 돌리고 로컬에서 손으로 실행한다.
- `figma_import_tokens`는 기존 토큰 **값 변경**만 적용한다. **신규 토큰 추가**(예: Phase C의 `red-700`)는 `figma_setup_design_tokens`로 따로 만든다.
- DTCG 입력만 완전 지원한다. scss 입력은 `NotImplementedError`다.

## 드리프트 베이스라인 (2026-06-13)

- 방법: `figma_export_tokens(format=scss)`로 Figma 값을 뽑아 `src/styles/tokens/*`와 같은 이름 raw-hex 토큰을 값 비교.
- 결과: 비교 대상 41개 중 40개 정확 일치, 1개 값-동일(`$white`: Figma `#FFFFFF` = 소스 `#fff`). **값 드리프트 0건.**
- semantic 16개는 Figma가 hex로 해석하고 소스는 alias(`$txt-primary: $gray-900`)라 자동 비교에서 빠진다. 이름 매핑 자동 비교는 후속 과제.

## 텍스트·이펙트 스타일 — DTCG 미포함

`figma_export_tokens`는 변수 174개만 뽑는다. Figma의 텍스트 스타일 12종과 이펙트 스타일 4종은 변수가 아니라 별도 스타일이다. 그래서 DTCG에 안 들어간다. 코드 기준 원본은 `_typography.scss`·`_effect.scss`이고, 아래는 Figma에 만든 스타일 스펙이다(모바일 값, 2026-06-13 `figma_get_text_styles`로 확인).

### 텍스트 스타일 12종

family는 Pretendard(정적 설치), 인용만 Noto Serif KR. lineHeight 단위 PERCENT, letterSpacing PIXELS.

| 스타일 | family / style | size | lineHeight | letterSpacing |
| --- | --- | --- | --- | --- |
| Heading/H1 | Pretendard / Bold | 32 | 130% | -1 |
| Heading/H2 | Pretendard / Bold | 26 | 130% | -0.5 |
| Heading/H3 | Pretendard / Bold | 22 | 135% | -0.3 |
| Heading/H4 | Pretendard / SemiBold | 20 | 145% | -0.3 |
| Heading/H5 | Pretendard / SemiBold | 18 | 150% | -0.3 |
| Body/Default | Pretendard / Regular | 15 | 150% | -0.3 |
| Body/Reading | Pretendard / Regular | 15 | 160% | -0.3 |
| Body/Prose | Pretendard / Regular | 15 | 180% | -0.3 |
| Body/UI | Pretendard / Medium | 14 | 145% | -0.3 |
| Label/Caption | Pretendard / Regular | 13 | 145% | -0.3 |
| Label/Small | Pretendard / Medium | 12 | 145% | 1 |
| Quote/Serif | Noto Serif KR / Regular | 18 | 160% | -0.3 |

> 데스크톱 heading은 코드에서 더 크다(h1 42 / h2 34 / h3 28 / h4 24 / h5 20). Figma는 모드 1개라 모바일 값만 담는다.

### 이펙트(그림자) 스타일 4종

전부 DROP_SHADOW, 색은 `rgba($gray-900, a)`(gray-900 = #111827). offset x는 0.

| 스타일 | 레이어 (offset y · blur · spread · alpha) | 코드 |
| --- | --- | --- |
| Shadow/sm | (y1) blur3 spread0 a0.06 | `$shadow-sm` |
| Shadow/md | (y3) blur8 spread-1 a0.08 + (y1) blur3 spread-1 a0.06 | `$shadow-md` |
| Shadow/lg | (y6) blur16 spread-2 a0.10 + (y2) blur6 spread-2 a0.06 | `$shadow-lg` |
| Shadow/xl | (y8) blur32 spread0 a0.12 + (y4) blur16 spread0 a0.08 | `$shadow-xl` |
