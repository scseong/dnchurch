// site_collections.items(jsonb) narrow용 TS 타입.
// admin UI form-level 검증으로 shape 보장 — 자세한 정책은 docs/decisions/0006.

export type HistoryItem = { year: string; text: string };
export type FaqItem = { q: string; a: string };
export type GreetingParagraph = string;
