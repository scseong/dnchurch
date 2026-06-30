// 새가족 등록 폼의 선택지·길이 제한 — 클라이언트 컴포넌트(표시)와 서버 액션(검증)이 공유한다.
// 허용값은 DB CHECK 제약(supabase/migrations/20260630000000_harden_new_family_registrations.sql)과
// 동기화한다 — 옵션을 바꾸면 마이그레이션도 함께 고친다.

export const REFERRAL_OPTIONS = ['지인 소개', '인터넷 검색', '우연히 방문', '기타'] as const;
export const INTEREST_OPTIONS = ['자녀 교육', '교제', '봉사', '양육', '예배'] as const;

export type ReferralOption = (typeof REFERRAL_OPTIONS)[number];
export type InterestOption = (typeof INTEREST_OPTIONS)[number];

// name/phone 길이와 interests 개수 한도 — 서버 액션과 DB CHECK가 같은 값을 쓴다.
// referral은 화이트리스트(REFERRAL_OPTIONS)라 길이 한도가 필요 없다.
export const NEW_FAMILY_LIMITS = {
  nameMax: 50,
  phoneMin: 8,
  phoneMax: 30,
  interestsMax: INTEREST_OPTIONS.length
} as const;
