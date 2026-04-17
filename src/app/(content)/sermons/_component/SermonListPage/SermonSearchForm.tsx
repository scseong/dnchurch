'use client';

import { useEffect, useState } from 'react';
import { IoClose, IoSearch } from 'react-icons/io5';
import useSermonFilter from '@/hooks/useSermonFilter';
import styles from './SermonListPage.module.scss';

export default function SermonSearchForm() {
  const { q, setFilter } = useSermonFilter();
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
          placeholder="제목 또는 성경구절 검색"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          aria-label="설교 검색"
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
