'use client';

import { HiOutlineSearch, HiX } from 'react-icons/hi';
import styles from '../index.module.scss';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
}

export default function SearchBox({ value, onChange, onClear }: SearchBoxProps) {
  return (
    <div className={styles.search_box}>
      <HiOutlineSearch className={styles.search_icon} aria-hidden />
      <input
        type="text"
        className={styles.search_input}
        placeholder="제목, 성경 구절, 설교자로 검색"
        aria-label="설교 검색"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={styles.search_clear}
          onClick={onClear}
          aria-label="검색어 지우기"
        >
          <HiX />
        </button>
      )}
    </div>
  );
}
