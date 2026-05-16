'use client';

import { useEffect, useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import useSeriesFilter from '@/hooks/useSeriesFilter';
import styles from './SeriesListPage.module.scss';

export default function SeriesSearchForm() {
  const { q, setFilter } = useSeriesFilter();
  const [input, setInput] = useState(q);

  useEffect(() => {
    setInput(q);
  }, [q]);

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
