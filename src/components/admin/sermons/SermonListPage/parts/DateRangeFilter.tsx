'use client';

import FilterDropdown from './FilterDropdown';
import dropdownStyles from '../dropdown.module.scss';

interface DateRangeValue {
  from: string;
  to: string;
}

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onChange: (value: DateRangeValue) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function DateRangeFilter({
  dateFrom,
  dateTo,
  onChange,
  isOpen,
  onToggleOpen
}: DateRangeFilterProps) {
  const hasValue = Boolean(dateFrom || dateTo);

  return (
    <FilterDropdown
      label="기간"
      count={hasValue ? 1 : 0}
      isOpen={isOpen}
      onToggle={onToggleOpen}
    >
      <p className={dropdownStyles.dropdown_title}>설교 날짜 범위</p>
      <div className={dropdownStyles.date_row}>
        <input
          type="date"
          className={dropdownStyles.date_input}
          value={dateFrom}
          onChange={(event) => onChange({ from: event.target.value, to: dateTo })}
          aria-label="시작일"
        />
        <span aria-hidden>~</span>
        <input
          type="date"
          className={dropdownStyles.date_input}
          value={dateTo}
          onChange={(event) => onChange({ from: dateFrom, to: event.target.value })}
          aria-label="종료일"
        />
      </div>
      {hasValue && (
        <button
          type="button"
          className={dropdownStyles.date_clear}
          onClick={() => onChange({ from: '', to: '' })}
        >
          초기화
        </button>
      )}
    </FilterDropdown>
  );
}
