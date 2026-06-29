# about-children-redesign

- **상태**: 🟡 진행 중
- **시작일**: 2026-06-28
- **브랜치**: style/home-bg-remove-preview
- **Open questions**: none
- **ADR needed**: no

## 목표

About 나머지 4개 페이지(worship 예배 안내·location 오시는 길·vision 교회의 비전·welcome 환영합니다)를 `한빛교회 - 교회 소개 (2)` 목업 레이아웃으로 재디자인한다. 인사말 페이지([[2026-06-28-about-warm-redesign]])에서 만든 warm 카드 시스템·AboutTabNav를 그대로 재사용하고, 실데이터가 없는 콘텐츠는 대구동남교회용 플레이스홀더로 채운다.

## 검증된 Assumptions

(EXPLORE에서 직접 확인한 사실만. 데이터 소스 항목은 explorer 매핑 후 추가.)

- 목업(`docs/references/한빛교회 - 교회 소개 (2).html`, 8138 서버)은 5탭 단일 SPA. 4개 페이지 구조를 JS DOM 추출로 확인:
  - **worship**: 카테고리별(주일·주중·다음세대) warm 카드, 행 = `예배명 + "대표 예배" 골드 pill · 위치 · 시간(골드 #6e5016)`
  - **location**: 지도 임베드 + 골드 "길찾기" 버튼 + 정보 카드(전화 등) + 대중교통·주차·층별 안내 카드
  - **vision**: 다크 "OUR VISION" 히어로 카드(비전 선언문) + 번호 매긴 warm 카드 3개(골드 원형 번호 + 제목 + 설명)
  - **welcome**: 인사 카드("처음 오시나요?") + 사진 3그리드 + "새가족 4주 과정" 스텝 타임라인 + FAQ 아코디언
- 목업 색은 인사말과 동일 — `#6e5016`(=$home-gold-strong), 카드 white·r:16~18px·border #efe7df(=$home-border). 신규 토큰 0으로 재현 가능.
- 4개 페이지 모두 **이미 구현돼 있고 데이터층이 붙어 있다** (explorer 매핑, 읽기 전용 확인). 이번 작업은 목업 레이아웃으로 re-skin이지 신규 구축이 아니다. 페이지별 데이터 출처:
  - **worship** (`page.tsx`, 서버): `getWorshipPageData()` → DB `worship_schedules` 9행. page 소비 필드 = `name·age_group·location·time`. DB에 `is_featured`·`description`·`duration`도 시드됐으나 현 page 미사용 — 목업 "대표 예배" pill = `is_featured`. statement 인용·그룹 라벨·CTA는 page 하드코딩 상수.
  - **location** (`page.tsx`, 서버 + client 3종): `getLocationPageData()` → `site_settings` 15키 + worship groups. 실데이터 = 주소·좌표·지하철·버스. `'준비 중'`(TODO) = 전화·이메일·우편번호·주차. 지도(`LocationMapClient`)·길찾기(`AddressActions` 네이버맵)는 이미 존재.
  - **vision** (`page.tsx`, 서버): `getVisionPageData()` → `church_history`(실 1행 1952 + TODO 4 필터됨). 슬로건·5단락 `VISION_STATEMENT`·3기둥(TRUTH/WORSHIP/LIFE)·이미지는 page 하드코딩.
  - **welcome** (`page.tsx`, 서버): `getWelcomePageData()` → `welcome_faq`(실 4건 완비). 환영 카피·4 STEPS·CTA는 page 하드코딩.
- `getSiteCollection` 키는 `church_history`·`welcome_faq` **2개뿐**. `CHURCH_INFO`(seo.ts)는 좌표·주소 fallback 전용 — 전화/예배시간 없음(site_settings에 위임).
- worship `_component/{AboutWorship,SchoolGrid,WorshipCard}.tsx`는 page 미참조 orphan(knip "unused" 정확, FEATURE_SPEC tech-debt 기록됨).

## Success Criteria

- [ ] 4개 페이지가 목업 레이아웃을 따르고, 인사말과 같은 warm 카드·AboutTabNav·sticky 헤더 톤을 공유한다.
- [ ] 시간·주소·전화 등 사실은 기존 `getXxxPageData()` 결과와 연결된 실데이터·fallback만 쓴다(`CHURCH_INFO`는 좌표·주소 fallback 전용). 없는 사실은 지어내지 않는다.
- [ ] 비전 선언문·환영 인사·FAQ·4주 과정처럼 DB에 없는 콘텐츠는 대구동남교회용 플레이스홀더로 채우고, 교체 가능하게 상수로 분리한다.
- [ ] `verify-task` 필수 3단계(lint·styles·build) 통과. 스타일 값은 토큰만(하드코딩 0).
- [ ] 각 페이지를 Chrome `/about/<route>`에서 실측해 목업과 대조한다.

## 영향받는 파일

- `src/app/(content)/about/worship/page.tsx` · `page.module.scss` (기존 `_component/*` orphan은 D3에 따라 이번 범위 제외)
- `src/app/(content)/about/location/page.tsx` · `page.module.scss` (+ 기존 `_component/*` 지도 재사용)
- `src/app/(content)/about/vision/page.tsx` · `page.module.scss`
- `src/app/(content)/about/welcome/page.tsx` · `page.module.scss`
- (데이터 공백 시) 페이지별 콘텐츠 상수 파일 — 위치는 file-structure 규칙 따라 결정

## 단계별 체크리스트

- [x] 1. explorer 데이터 매핑 반영 → 페이지별 실데이터/플레이스홀더 확정
- [x] 2. Codex 계획 검증 (PASS_WITH_DECISION_LOG)
- [x] 3. worship 구현 → 커밋 `014f3af` — 세부 디자인은 사용자 라이브 수정으로 plan과 상이(카드 무그림자·연령 알약 배지·다음세대 풀폭 CTA·브라운 시간 등)
- [x] 4. location 구현(목업 재스킨) → 검증(아래 Claude 2차 표) → 커밋 `e896fca`
- [x] 5. vision 구현(목업 재스킨) → 검증(아래 Claude 2차 표)·Chrome 육안 → 커밋 대기
- [ ] 6. welcome 구현 → Chrome 검증 → 커밋

> 진행 중 함께 나온 부수 작업(별도 커밋): 워옴 팔레트 브라운 전환 `49caed9`, 모바일 헤더 정리 `4971400`, LayoutContainer 본문 패딩 일원화 `c6298d0`, 인사말 페이지 톤 정렬 `e6d9627`, 교회 소개 탭 내비 active 라벨 진하게 `c095d11`. 팔레트 최종값은 브라운 `#7a6654`·카드 흰색.

## Verification

- `node scripts/verify-task.mjs about-children-redesign`

## 의사결정 로그

- **D1 — 인사말의 warm 카드 시스템·AboutTabNav를 그대로 재사용**
  - 문제: 4개 페이지에 목업 톤을 입혀야 하는데, 각자 새 스타일을 짜면 인사말과 안 맞고 토큰이 늘어난다.
  - 해결: [[2026-06-28-about-warm-redesign]]에서 만든 `warm-card` 패턴·`$home-*` 토큰·`AboutTabNav`를 재사용한다. 신규 토큰 0(memory "토큰 추가보다 단순화 선호"). vision 다크 히어로 등 목업 고유 요소만 페이지 로컬로 추가.
  - 결과: 5개 About 페이지가 한 디자인 언어를 공유한다.
- **D2 — 기존 데이터 fetch·콘텐츠 상수를 재사용, 플레이스홀더는 목업이 새로 요구하는 칸만**
  - 문제: 페이지마다 이미 데이터층(DB + 하드코딩 상수)이 붙어 있다. 목업대로 다시 만들면 실데이터 배선을 잃는다.
  - 해결: 기존 `getXxxPageData()`와 콘텐츠 상수(VISION_STATEMENT·WELCOME_STEPS 등)를 유지하고 레이아웃만 목업으로 바꾼다. 목업이 새로 요구하는 칸(welcome 인사 카피·location 층별 안내 등 기존에 없던 것)만 대구동남교회용 플레이스홀더로 채우고 교체 가능한 상수로 분리(사용자 지시 2026-06-28). 사실(시간·주소·전화)은 실데이터·'준비 중'만.
  - 결과: 실데이터 배선을 보존하면서 목업 레이아웃을 입힌다.
- **D3 — worship orphan 3종은 이번 스타일 커밋에서 손대지 않는다**
  - 문제: `worship/_component/{AboutWorship,SchoolGrid,WorshipCard}.tsx`는 page 미참조 dead code다(knip·FEATURE_SPEC 확인). 목업 worship은 page 인라인 카드라 이 컴포넌트들이 필요 없다.
  - 해결: 외과적 변경 원칙(CLAUDE.md "기존 dead code는 발견 시 보고만") 따라 스타일 커밋에 삭제를 섞지 않는다. 별도 `Chore: worship orphan 컴포넌트 제거`로 분리 제안(후속).
  - 결과: 한 커밋이 한 의도를 지킨다.
- **D4 — location을 목업대로 재구성하며 예배시간표는 제거하고 층별 안내는 플레이스홀더로 채운다**
  - 문제: 목업 location은 예배시간표 대신 연락처·대중교통·주차·층별 안내로 재구성됐다. 기존 page엔 WORSHIP SCHEDULE 블록이 있었고, 층별 안내는 site_settings에 데이터가 없다.
  - 해결: 예배시간표 블록을 뺐다 — 예배 시간은 전용 '예배 안내' 탭에 이미 있어 중복이고, `getLocationPageData`의 worship fetch도 함께 지워 안 쓰는 쿼리를 없앴다. 층별 안내는 처음엔 보류했으나 사용자 요청으로 넣고 사용자가 준 실데이터로 채웠다 — 본관은 `MAIN_BUILDING_FLOORS`(3 유아실·2 대예배실·1 소예배실·카페·사무실·B1 식당), 교육관은 층 구분 없는 공간이라 `EDUCATION_ROOMS`(유초등부실·청년부실·안나실)에 'G'(Ground) 배지로. 주차는 `DEFAULT_PARKING`(약 10대) 상수를 site_settings 미입력 시 fallback으로 뒀다. 연락처·대중교통은 기존 실데이터·'준비 중' fallback을 그대로 배선했다.
  - 결과: 목업 시각 언어(지도+길찾기 브라운 버튼·연락처 칩 행·warm 카드·층별 배지 목록)를 실데이터로 재현하고, 예배 시간 중복과 쓸데없는 데이터 조회를 제거했다. 지도 마커는 기본 Kakao 핀 대신 `CustomOverlayMap`으로 교회 이름 라벨 + 교회 심볼(LuChurch) 브라운 핀을 직접 그려 교회 위치임을 분명히 했다.
- **D5 — vision을 목업대로 히어로 + 비전 카드 3개로 줄이고 5단락 선언문·이미지·연혁은 뺀다**
  - 문제: 목업 vision 패널은 비전 선언 히어로 + 세 가지 비전 카드뿐인데, 기존 page엔 5단락 VISION_STATEMENT·전경 이미지·HISTORY 타임라인까지 있었다.
  - 해결: 히어로(슬로건을 브라운 그라디언트 + serif 선언으로)와 비전 기둥 3개(번호 배지 + 제목 + serif 본문, 아이콘·영문 라벨 제거)만 남겼다. 5단락 선언문·이미지는 목업에 없는 일반 산문이라 뺐고, HISTORY는 인사말(pastor) 탭의 '교회 이력'과 같은 `church_history`라 중복이라 뺐다. 그 결과 `getVisionPageData`(history만 반환)가 안 쓰여 page는 fetch 없는 정적 페이지가 됐고 해당 service 함수도 지웠다.
  - 결과: vision이 목업과 같은 짧고 또렷한 구조가 됐고, 인사말과 겹치던 연혁 중복이 사라졌다.

## ADR 판단

- `src/services/about/index.ts` `getLocationPageData`에서 worship fetch 제거 — 소비처(location page)가 더 이상 안 쓰는 일회성 정리다. 레이어·캐시·인증 정책 변화 없음. ADR 불필요.
- `src/services/about/index.ts` `getVisionPageData` 함수 제거 — vision page가 정적이 되며 유일 소비처가 사라진 dead export 정리(knip 신규 경고 방지). 레이어·캐시·인증 정책 변화 없음. ADR 불필요.

## 후속 작업

- worship orphan 컴포넌트 3종(+`.module.scss`) 제거
  - 이유: dead code 정리는 스타일 재디자인과 별개 관심사 (D3)
  - 다음 기준: worship 재디자인 커밋 후 별도 Chore 커밋
  - 기록 위치: `docs/research/FEATURE_SPEC.md`에 이미 tech-debt 후보로 기록됨
- vision 메타 description 불일치 — `metadata.description`이 '2025년 교회목표 - 주님의 기도를 배우는 교회'인데 페이지엔 슬로건 '복음 위에 서서, 이웃과 함께 자라는 교회'가 뜬다 (재디자인 때 VISION_STATEMENT '1958' 단락은 제거돼 그 충돌은 해소)
  - 이유: 실제 교회목표·연도를 모름. SEO 문자열이라 임의 변경하면 사실을 지어내는 셈 (지어내지 않음 원칙)
  - 다음 기준: 교회에 실제 비전 문구·연도 확인 후 메타 갱신
  - 기록 위치: 없음 — 사용자에게 보고
- location 전화·이메일·우편번호 = admin 입력 전까지 '준비 중'
  - 이유: site_settings TODO placeholder, 실데이터 없음
  - 다음 기준: admin UI에서 입력 시
  - 기록 위치: 없음
- location 층별 안내·주차 = 페이지 상수에 박은 실데이터(`MAIN_BUILDING_FLOORS`·`EDUCATION_ROOMS`·`DEFAULT_PARKING`)
  - 이유: site_settings에 해당 키가 없어 사용자 확인 값을 page 상수로 둠. 주차는 settings 입력 시 대체되는 fallback
  - 다음 기준: 운영자가 admin/site_settings로 옮길지 결정 시
  - 기록 위치: 없음

---

<!-- 검증 섹션 — Codex/Claude 호출 후 verdict 1줄 갱신. harness-gate가 verdict token + placeholder denylist + 최소 30자 본문 강제. -->

## Codex 계획 검증

- **결론**: PASS_WITH_DECISION_LOG (confidence high)
- **현재 판단**: material 지적 0건. expression-only 3건은 plan 문구 수정으로 해소 — ① 영향 파일 worship 줄을 D3와 맞춰 "이번 범위 제외"로 정정(이전엔 "explorer 후 결정"이라 D3과 충돌), ② SC의 "실데이터(`CHURCH_INFO` 등)"를 "`getXxxPageData()` 결과·fallback"으로 정정(`CHURCH_INFO`는 좌표·주소 fallback 전용이라 전화·예배시간 출처처럼 읽히던 문제), ③ 빈 템플릿 `## 후속 작업` 중복 heading 삭제. 5체크(Assumptions·Non-goals·요청 연결·SC/검증·신규 추상화) 모두 통과.
- **다음 행동**: worship부터 페이지별 구현 → Chrome 검증 → 커밋.

## Codex 1차 검증

- **결론**: 미요청
- **현재 판단**: location은 인사말·worship과 같은 warm 재스킨이고 고위험 파일 없음(레이어·캐시·인증 무변). 큰 신규 로직이 없어 Claude 직접 검증으로 대체.
- **다음 행동**: vision·welcome에서 데이터 흐름·타입 변경이 생기면 Codex 1차 요청.

## Claude 2차 검증

- **최종 판단**: 통과 (커밋 대기)
- **현재 판단**: 아래 표. verify-task는 사용자 dev 구동 중이라 미실행(.next 공유 손상 방지) — tsc·eslint·stylelint + dev 라우트 실측으로 대체. 지도 마커는 Kakao 클라이언트 렌더라 curl에 안 잡혀 Chrome 육안 검증 — 첫 구현은 teardrop이 `rotate(45deg)`라 핀이 옆을 가리켰고, `rotate(-45deg)`(svg는 반대로)로 고쳐 핀이 아래로 향하며 교회 심볼·라벨이 좌표(Kakao POI '동남교회')에 맞는 것 확인.

| 시점 | 명령 | 결과 |
| --- | --- | --- |
| 2차 | `npx tsc --noEmit` | ✅ exit 0 |
| 2차 | `npx eslint` (page·CopyChip·service·navigation·hero.config) | ✅ exit 0 |
| 2차 | `npx stylelint` (location page.module.scss) | ✅ exit 0 |
| 2차 | dev `/about/location` curl | ✅ HTTP 200<br>길찾기·대중교통·주차·통화·층별 안내(본관·교육관) 마커 렌더<br>WORSHIP SCHEDULE 제거 확인 |
| 2차 | vision `tsc·eslint·stylelint` | ✅ exit 0 (page·service·navigation·hero.config) |
| 2차 | dev `/about/vision` curl + Chrome | ✅ - HTTP 200<br>- OUR VISION·세 가지 비전·번호 카드 3개 렌더<br>- HISTORY·VISION STATEMENT 제거 확인<br>- 브라운 그라디언트 히어로·serif 본문 Chrome 육안 확인 |

## 검증 이력

<!--
이전 판정·재검증만 여기에 둔다. 검증 섹션 본문에는 현재 판정만 남긴다.
규칙: `**결론**:`·`**최종 판단**:` 금지. `판정:`을 쓴다. <details> 본문은 3줄 이하.

<details>
<summary>YYYY-MM-DD Codex 계획 검증 1차</summary>

- 판정: CHANGE_REQUEST
- 이유: <핵심 이유 1개>
- 조치: <D번호 또는 수정 위치>

</details>
-->

---

<!-- 이하 섹션은 해당 시에만 추가:
## Non-goals          ← surgical scope 정의가 필요한 경우 (인접 정리 차단)
## 감사               ← DB/타입/config 사전 점검 결과
## 접근법             ← 결정이 1줄 이상 필요한 경우 (대안·기각 사유는 의사결정 로그·ADR)
## 의사결정 로그       ← plan 변경 또는 expression CR 기록 (아래 형식 고정)
## ADR 판단            ← ADR_TRIGGER_PARTS 파일 변경 시 (mandatory 1줄 필드를 이 섹션으로 승격)
## 참고 자료           ← docs/research/ 발췌 링크
## 리뷰 (완료 직전)    ← 셀프/멀티 세션 리뷰 체크
## 회고               ← 머지 후 completed/ 이동 시

의사결정 로그 항목 형식 (한 항목 = 한 결정. 기호(·/→/+)로 사실 잇기·약어 금지):

- **D1 — 한 줄 제목(무엇을 정했나, 평이하게)**
  - 문제: 어떤 문제·제약이 있었나.
  - 해결: 어떤 방법들이 있었고, 무엇을 택했나 — **왜 그 방법인가(이유)가 핵심**. 대안이 있었으면 왜 그것 대신인지.
  - 결과: 무엇이 달라졌나 / 성과.

"무엇을 했다"로 끝내지 말 것 — 의사결정 맥락(왜)이 빠지면 나중에 문서로 맥락 복구 불가.
결정이 여러 개면 D2, D3 …로 분리. 폐기 시 원래 항목 끝에 `⚠️ 정정(PR #xx): 폐기 → D5 참조` 한 줄.

검증 기록(Codex 1차·Claude 2차)은 공통 결과를 표 1개로 — 단락 반복 금지:

| 시점 | run-id | lint | styles | build | knip신규 | 수동 확인 필요 |
| --- | --- | --- | --- | --- | --- | --- |
| 1차 | 20260517-000000 | ✅ | ✅ | ✅ | 0 | — |
-->

<!--
검증 결과 기록 규칙 SSOT: `.claude/skills/harness-workflow/SKILL.md` "## 검증 결과 기록 규칙".
- 추상명사 금지. 구체화 4원소 중 2개 이상.
- Codex stdout은 verbatim. 그 아래 평이한 풀이 1줄.
- 의사결정 로그·검증 기록은 위 형식 고정. 압축·기호잇기·약어·한 항목 다결정 금지.
-->

