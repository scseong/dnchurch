'use client';

import { type ReactNode } from 'react';
import clsx from 'clsx';
import { HiChevronDown, HiOutlineFilter } from 'react-icons/hi';
import dropdownStyles from '../dropdown.module.scss';

interface FilterDropdownProps {
  label: string;
  count: number;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export default function FilterDropdown({
  label,
  count,
  isOpen,
  onToggle,
  children
}: FilterDropdownProps) {
  const isActive = count > 0;

  return (
    <div className={dropdownStyles.dropdown} data-dropdown>
      <button
        type="button"
        className={clsx(
          dropdownStyles.filter_trigger,
          isActive && dropdownStyles.filter_active
        )}
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <HiOutlineFilter aria-hidden />
        <span>{label}</span>
        {isActive && <span className={dropdownStyles.filter_count}>{count}</span>}
        <HiChevronDown aria-hidden />
      </button>
      {isOpen && <div className={dropdownStyles.dropdown_panel}>{children}</div>}
    </div>
  );
}
