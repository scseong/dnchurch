import { SelectHTMLAttributes } from 'react';
import clsx from 'clsx';
import styles from './Select.module.scss';

export type SelectOption = { value: string; label: string };

// multiple·size·children은 단일 값 계약과 충돌하므로 타입에서 제외(Codex 1차).
type SelectProps = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange' | 'multiple' | 'size' | 'children'
> & {
  /** 현재 값 (제어 컴포넌트). */
  value: string;
  /** 값 변경. 이벤트가 아닌 선택된 값 문자열을 직접 받는다. */
  onChange: (value: string) => void;
  /** 옵션 목록. `<option>` children이 아니라 배열로 받는다 — 내부 구현이 바뀌어도 호출부 불변. */
  options: SelectOption[];
  /** 비기본 값이 선택됐음을 강조(활성 필터 표시). */
  emphasized?: boolean;
};

/**
 * 단일 값 선택 (제어 컴포넌트). styled native `<select>` + custom chevron.
 *
 * - 값 즉시 확정(`onChange`가 바로 호출됨) — 다중 필드 staged 시트와는 다른 용도다
 * - 옵션은 `options` 배열로 받는다(children `<option>` 아님)
 * - `display`를 직접 정하지 않는다 — 반응형 노출은 호출부가 `className`으로 제어한다
 * - 시각 레이블이 없으면 `aria-label`을 넘겨 접근성 이름을 준다
 *
 * @example
 * ```tsx
 * <Select
 *   value={sort}
 *   onChange={setSort}
 *   options={[{ value: 'recent', label: '최신순' }, { value: 'oldest', label: '오래된순' }]}
 *   emphasized={sort !== 'recent'}
 *   aria-label="설교 정렬"
 * />
 * ```
 */
export function Select({ value, onChange, options, emphasized, className, ...rest }: SelectProps) {
  return (
    <select
      {...rest}
      className={clsx(styles.select, emphasized && styles.emphasized, className)}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
