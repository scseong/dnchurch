'use client';

import FilterDropdown from './FilterDropdown';
import DropdownItem from './DropdownItem';
import type { Preacher } from '@/types/sermon';
import dropdownStyles from '../dropdown.module.scss';

interface PreacherFilterProps {
  preachers: Preacher[];
  selected: string[];
  onToggle: (id: string) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export default function PreacherFilter({
  preachers,
  selected,
  onToggle,
  isOpen,
  onToggleOpen
}: PreacherFilterProps) {
  return (
    <FilterDropdown
      label="설교자"
      count={selected.length}
      isOpen={isOpen}
      onToggle={onToggleOpen}
    >
      <p className={dropdownStyles.dropdown_title}>설교자 선택</p>
      <div className={dropdownStyles.dropdown_list}>
        {preachers.map((preacher) => (
          <DropdownItem
            key={preacher.id}
            selected={selected.includes(preacher.id)}
            label={preacher.name}
            onSelect={() => onToggle(preacher.id)}
          />
        ))}
      </div>
    </FilterDropdown>
  );
}
