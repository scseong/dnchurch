'use client';

import { IoCheckmark } from 'react-icons/io5';
import BottomSheet from '@/components/common/BottomSheet/BottomSheet';
import { ListItem } from '@/components/ui/ListItem/ListItem';
import { NOTICE_CATEGORIES } from '@/constants/notice';
import type { NoticeCategory } from '@/types/notice';
import styles from './CategoryBottomSheet.module.scss';

type Props = {
  isOpen: boolean;
  currentCategory?: NoticeCategory;
  onSelect: (category: string) => void;
  onClose: () => void;
};

export default function CategoryBottomSheet({ isOpen, currentCategory, onSelect, onClose }: Props) {
  return (
    <BottomSheet open={isOpen} onClose={onClose} title="분류 선택">
      <ul className={styles.option_list}>
        <li>
          <ListItem
            selected={!currentCategory}
            onClick={() => onSelect('')}
            trailing={!currentCategory ? <IoCheckmark className={styles.check} aria-hidden="true" /> : undefined}
          >
            전체 분류
          </ListItem>
        </li>
        {Object.entries(NOTICE_CATEGORIES).map(([key, label]) => (
          <li key={key}>
            <ListItem
              selected={currentCategory === key}
              onClick={() => onSelect(key)}
              trailing={
                currentCategory === key ? (
                  <IoCheckmark className={styles.check} aria-hidden="true" />
                ) : undefined
              }
            >
              {label}
            </ListItem>
          </li>
        ))}
      </ul>
    </BottomSheet>
  );
}
