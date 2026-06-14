'use client';

import { FormEvent, InputHTMLAttributes, useRef } from 'react';
import clsx from 'clsx';
import { IoClose, IoSearch } from 'react-icons/io5';
import styles from './SearchField.module.scss';

type SearchFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'onSubmit'
> & {
  /** 현재 검색어 (제어 컴포넌트). */
  value: string;
  /** 입력 변경. 이벤트가 아닌 값 문자열을 직접 받는다. */
  onChange: (value: string) => void;
  /** clear 버튼 클릭. 미지정이면 `onChange('')`로 비운다. 지정 시 caller가 value 초기화까지 책임진다(focus 복귀는 SearchField가 처리). */
  onClear?: () => void;
  /** 지정 시 컨테이너가 `<form>`이 되어 Enter 제출을 받는다. 미지정이면 `<div>`. */
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** 진행 중 — 검색 아이콘 자리에 스피너를 보이고 컨테이너에 `aria-busy`. */
  loading?: boolean;
};

/**
 * 검색 입력 필드 (제어 컴포넌트).
 *
 * - leading 검색 아이콘 고정, 값이 있을 때만 trailing clear 버튼 노출
 * - clear는 `onClear`(없으면 `onChange('')`) 호출 후 input에 focus 복귀
 * - `onSubmit`을 주면 `<form>`으로 렌더돼 Enter 제출을 받는다 (없으면 `<div>`)
 * - landmark-neutral — `role="search"`를 직접 내지 않는다. 검색 landmark가 필요하면
 *   호출부가 `<search>`/`role="search"` 컨테이너로 감싼다
 * - 시각 레이블이 없으므로 `aria-label`을 prop으로 넘겨 접근성 이름을 준다
 *
 * @example
 * ```tsx
 * <SearchField value={q} onChange={setQ} aria-label="설교 검색" placeholder="제목·성경구절" />
 * <search>
 *   <SearchField value={q} onChange={setQ} onSubmit={handleSubmit} aria-label="공지사항 검색" />
 * </search>
 * ```
 */
export function SearchField({
  value,
  onChange,
  onClear,
  onSubmit,
  loading = false,
  className,
  ...inputProps
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    if (onClear) onClear();
    else onChange('');
    inputRef.current?.focus();
  };

  const body = (
    <>
      <span className={styles.leading} aria-hidden="true">
        {loading ? <span className={styles.spinner} /> : <IoSearch />}
      </span>
      <input
        {...inputProps}
        ref={inputRef}
        type="text"
        className={styles.input}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={handleClear}
          aria-label="검색어 지우기"
        >
          <IoClose aria-hidden="true" />
        </button>
      )}
    </>
  );

  const containerClassName = clsx(styles.field, className);

  if (onSubmit) {
    return (
      <form className={containerClassName} onSubmit={onSubmit} aria-busy={loading || undefined}>
        {body}
      </form>
    );
  }

  return (
    <div className={containerClassName} aria-busy={loading || undefined}>
      {body}
    </div>
  );
}
