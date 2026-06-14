'use client';

import { useEffect, useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import useSeriesFilter from '@/hooks/useSeriesFilter';
import { SearchField } from '@/components/ui';
import styles from './SeriesListPage.module.scss';

export default function SeriesSearchForm() {
  const { q, setFilter } = useSeriesFilter();
  // 초기값만 URL q에서. q→input 미러링 effect는 제거 — 디바운스 navigation이
  // 늦게 끝날 때 그 사이 입력을 되돌리던 버그(PR #95 #4)의 원인이었고,
  // 입력은 사용자 소유다. (외부 q 변경은 라우트 전환 시 재마운트로 반영)
  const [input, setInput] = useState(q);
  const debounced = useDebounce(input, 300);

  // 타이핑 멈춤 300ms 후 URL 반영.
  // - debounced가 현재 input과 같을 때만(디바운스 정착) push — Enter/clear 등 즉시 액션으로
  //   q·setFilter가 바뀌어 effect가 재실행돼도 stale debounced 재-push 차단(Codex 1차 BUG fix)
  // - trim 정규화 동일값이면 skip(trailing whitespace·feedback loop 차단, DL-1/2)
  useEffect(() => {
    if (debounced !== input) return;
    if (debounced.trim() === q.trim()) return;
    setFilter({ q: debounced.trim() || null });
  }, [debounced, input, q, setFilter]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilter({ q: input.trim() || null });
  };

  const handleClear = () => {
    setInput('');
    setFilter({ q: null });
  };

  return (
    <search className={styles.search_form}>
      <SearchField
        value={input}
        onChange={setInput}
        onClear={handleClear}
        onSubmit={handleSubmit}
        placeholder="시리즈 제목·설명"
        aria-label="시리즈 검색"
      />
    </search>
  );
}
