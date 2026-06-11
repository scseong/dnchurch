import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 300;

type SearchSync = {
  searchInput: string;
  setSearchInput: (value: string) => void;
  isSearchPending: boolean;
  clearSearch: () => void;
};

/**
 * 검색 입력값과 외부 필터 search를 디바운스를 사이에 두고 양방향 동기화한다.
 * effect 안 setState(구 queueMicrotask 우회) 대신 이벤트 핸들러 디바운스 +
 * 렌더 중 보정(prev-state 패턴)을 쓴다 — exec-plan D3.
 */
export function useSearchSync(
  search: string,
  setSearch: (value: string) => void
): SearchSync {
  // draft가 null이면 입력값은 외부 search를 그대로 따른다
  const [draft, setDraft] = useState<string | null>(null);
  // 마지막으로 setSearch에 보낸 값 — echo(우리가 보낸 값의 왕복)와 진짜 외부 변경을 구분한다
  const [lastSent, setLastSent] = useState(search);
  const [prevSearch, setPrevSearch] = useState(search);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 외부 변경(뒤로가기·필터 초기화) → draft 폐기. echo(search === lastSent)면 입력 중인 값 유지
  if (search !== prevSearch) {
    setPrevSearch(search);
    if (search !== lastSent) {
      setDraft(null);
    }
  }

  // 외부 변경 채택 직후 남은 디바운스 타이머 취소 — 안 하면 stale 타이머가 외부 변경을 되돌린다 (Codex CR 반영)
  useLayoutEffect(() => {
    if (draft === null && search !== lastSent && timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [draft, search, lastSent]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const setSearchInput = (value: string) => {
    setDraft(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      setSearch(value);
      setLastSent(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  const clearSearch = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setDraft('');
    setLastSent('');
    setSearch('');
  };

  const searchInput = draft ?? search;
  const isSearchPending = draft !== null && draft !== lastSent;

  return { searchInput, setSearchInput, isSearchPending, clearSearch };
}
