'use client';

import clsx from 'clsx';
import { HiCheck } from 'react-icons/hi';
import dropdownStyles from '../dropdown.module.scss';

interface DropdownItemProps {
  selected: boolean;
  label: string;
  onSelect: () => void;
  count?: number | null;
  truncate?: boolean;
}

export default function DropdownItem({
  selected,
  label,
  onSelect,
  count,
  truncate = false
}: DropdownItemProps) {
  const hasCount = count !== undefined && count !== null;

  return (
    <button
      type="button"
      aria-pressed={selected}
      className={clsx(
        dropdownStyles.dropdown_item,
        selected && dropdownStyles.dropdown_item_active
      )}
      onClick={onSelect}
    >
      <span
        className={clsx(
          dropdownStyles.checkbox,
          selected && dropdownStyles.checkbox_checked
        )}
        aria-hidden
      >
        {selected && <HiCheck />}
      </span>
      <span className={truncate ? dropdownStyles.dropdown_item_label : undefined}>
        {label}
      </span>
      {hasCount && <span className={dropdownStyles.item_count}>{count}</span>}
    </button>
  );
}
