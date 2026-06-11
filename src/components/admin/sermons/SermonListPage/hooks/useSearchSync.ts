import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';

type SearchSync = {
  searchInput: string;
  setSearchInput: (value: string) => void;
  isSearchPending: boolean;
  clearSearch: () => void;
};

/** 검색 입력값과 외부 필터 search를 디바운스를 사이에 두고 양방향 동기화한다 */
export function useSearchSync(
  search: string,
  setSearch: (value: string) => void
): SearchSync {
  const [searchInput, setSearchInput] = useState(search);
  const debouncedSearch = useDebounce(searchInput, 300);
  const lastExternalSearchRef = useRef(search);

  // URL/외부 변경 → 입력값 동기화 (디바운스 우회)
  useEffect(() => {
    if (search === lastExternalSearchRef.current) return;
    lastExternalSearchRef.current = search;
    queueMicrotask(() => setSearchInput(search));
  }, [search]);

  // 디바운스된 입력 → 필터 (외부 sync로 들어온 값은 skip)
  useEffect(() => {
    if (debouncedSearch === lastExternalSearchRef.current) return;
    lastExternalSearchRef.current = debouncedSearch;
    setSearch(debouncedSearch);
  }, [debouncedSearch, setSearch]);

  const isSearchPending = searchInput !== debouncedSearch;

  const clearSearch = () => {
    setSearchInput('');
    lastExternalSearchRef.current = '';
    setSearch('');
  };

  return { searchInput, setSearchInput, isSearchPending, clearSearch };
}
