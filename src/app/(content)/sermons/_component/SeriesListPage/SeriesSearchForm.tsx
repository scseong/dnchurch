'use client';

import { useEffect, useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import { useDebounce } from '@/hooks/useDebounce';
import useSeriesFilter from '@/hooks/useSeriesFilter';
import styles from './SeriesListPage.module.scss';

export default function SeriesSearchForm() {
  const { q, setFilter } = useSeriesFilter();
  const [input, setInput] = useState(q);
  const debounced = useDebounce(input, 300);

  useEffect(() => {
    setInput(q);
  }, [q]);

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
      <form role="search" onSubmit={handleSubmit}>
        <IoSearch className={styles.search_icon} aria-hidden="true" />
        <input
          type="text"
          className={styles.search_input}
          placeholder="시리즈 제목·설명"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="시리즈 검색"
        />
        {input && (
          <button
            type="button"
            className={styles.search_clear}
            onClick={handleClear}
            aria-label="검색어 지우기"
          >
            <IoClose />
          </button>
        )}
      </form>
    </search>
  );
}
