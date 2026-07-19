// 성경읽기 기록 공유의 통계 파싱·문구·렌더 상수.
// 공유 페이지(share/reading/page.tsx)와 OG 이미지 라우트(share/reading/image/route.tsx)가
// 같은 clamp 상한·라벨·문구·글자를 쓰게 해 카드와 랜딩 페이지의 숫자·문구 드리프트와
// 폰트 서브셋 두부(□)를 막는다 (bible-share-og-image Codex material-1·2).

const PERIODS = ['day', 'week', 'month'] as const;
type Period = (typeof PERIODS)[number];

export const PERIOD_LABEL: Record<Period, string> = {
  day: '오늘',
  week: '이번 주',
  month: '이번 달'
};

// 통계 숫자는 조작 가능한 공개 파라미터라 상한을 둔다 — 두 소비처가 같은 값을 쓰게 한곳에 모은다.
export const CHAPTERS_MAX = 9999;
export const SECONDARY_MAX = 366;

export function parsePeriod(value: string | undefined): Period {
  return PERIODS.includes(value as Period) ? (value as Period) : 'week';
}

// 비정수·음수·과대값을 안전 범위로 자른다.
export function parseCount(value: string | undefined, max: number): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) return 0;
  return Math.min(parsed, max);
}

export function subLine(period: Period, secondary: number): string {
  if (period === 'week') return `${secondary}일 함께한 한 주`;
  if (period === 'month') return `${secondary}일 읽은 이번 달`;
  return '오늘도 말씀과 함께했어요';
}

// OG 이미지(share/reading/image)가 그리는 고정 문구. 이미지 레이아웃과 폰트 서브셋이 이 상수를 쓴다.
// 이 값을 바꾸면 새 글자가 생기므로 서브셋 ttf를 다시 생성해야 한다(두부 방지) —
// 재생성 글자 = 아래 상수 + Object.values(PERIOD_LABEL) + subLine 세 출력 + '0123456789' + '“”:· '.
export const SHARE_BRAND = '대구동남교회';
export const SHARE_EYEBROW_SUFFIX = '성경읽기';
export const SHARE_STAT_SUFFIX = '장 읽음';
export const SHARE_VERSE = '주의 말씀은 내 발에 등이요 내 길에 빛이니이다';
export const SHARE_VERSE_REF = '시편 119:105';
