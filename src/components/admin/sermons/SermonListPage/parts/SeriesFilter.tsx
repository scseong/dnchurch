'use client';

import FilterDropdown from './FilterDropdown';
import DropdownItem from './DropdownItem';
import { NONE_SERIES_ID, type MockSeries } from './mockData';
import dropdownStyles from '../dropdown.module.scss';

interface SeriesFilterProps {
  series: MockSeries[];
  selected: string[];
  onToggle: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function SeriesFilter({
  series,
  selected,
  onToggle,
  isOpen,
  onToggleOpen
}: SeriesFilterProps) {
  const items: { id: string; label: string; count: number | null }[] = [
    { id: NONE_SERIES_ID, label: '단독 설교', count: null },
    ...series.map(({ id, title, count }) => ({ id, label: title, count }))
  ];

  return (
    <FilterDropdown
      label="시리즈"
      count={selected.length}
      isOpen={isOpen}
      onToggle={onToggleOpen}
    >
      <p className={dropdownStyles.dropdown_title}>시리즈 선택</p>
      <div className={dropdownStyles.dropdown_list}>
        {items.map((item) => (
          <DropdownItem
            key={item.id}
            selected={selected.includes(item.id)}
            label={item.label}
            count={item.count}
            truncate
            onSelect={() => onToggle(item.id)}
          />
        ))}
      </div>
    </FilterDropdown>
  );
}
