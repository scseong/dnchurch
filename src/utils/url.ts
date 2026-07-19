/**
 * open redirect 방지 — 파싱한 origin이 같은 사이트 내부 경로만 허용한다.
 * 문자열 접두사 검사(`//` 차단)는 `/\evil.com` 같은 역슬래시가 `new URL`에서 외부 origin으로
 * 정규화돼 우회된다. origin 동일성으로 검증해 역슬래시·절대 URL·protocol-relative를 모두 막는다.
 */
export function safeInternalPath(rawNext: string | null, origin: string, fallback = '/'): string {
  try {
    const url = new URL(rawNext ?? fallback, origin);
    if (url.origin === origin) return url.pathname + url.search;
  } catch {
    // 파싱 실패 시 fallback
  }
  return fallback;
}
