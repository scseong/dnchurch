'use client';

import { type ReactNode } from 'react';
import clsx from 'clsx';
import { HiChevronDown, HiOutlineFilter } from 'react-icons/hi';
import BottomSheet from '@/components/common/BottomSheet/BottomSheet';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const trigger = (
    <button
      type="button"
      className={clsx(
        dropdownStyles.filter_trigger,
        isActive && dropdownStyles.filter_active
      )}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup={isDesktop ? 'true' : 'dialog'}
    >
      <HiOutlineFilter aria-hidden />
      <span>{label}</span>
      {isActive && <span className={dropdownStyles.filter_count}>{count}</span>}
      <HiChevronDown aria-hidden />
    </button>
  );

  if (!isDesktop) {
    return (
      <div className={dropdownStyles.dropdown}>
        {trigger}
        <BottomSheet open={isOpen} onClose={onToggle} title={label}>
          {children}
        </BottomSheet>
      </div>
    );
  }

  return (
    <div className={dropdownStyles.dropdown} data-dropdown>
      {trigger}
      {isOpen && <div className={dropdownStyles.dropdown_panel}>{children}</div>}
    </div>
  );
}
