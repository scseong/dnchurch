'use client';

import clsx from 'clsx';
import { HiOutlineRefresh, HiOutlineSearch, HiX } from 'react-icons/hi';
import styles from '../index.module.scss';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isPending?: boolean;
}

export default function SearchBox({ value, onChange, onClear, isPending }: SearchBoxProps) {
  const Icon = isPending ? HiOutlineRefresh : HiOutlineSearch;
  return (
    <div className={styles.search_box}>
      <Icon
        className={clsx(styles.search_icon, isPending && styles.search_icon_pending)}
        aria-hidden
      />
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
