'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import BottomSheet from '@/components/common/BottomSheet/BottomSheet';
import type { Preacher } from '@/types/sermon';
import styles from './AdvancedFilterSheet.module.scss';

const ALL_KEY = '__all';

type Props = {
  open: boolean;
  onClose: () => void;
  preachers: Preacher[];
  activePreacher: string | null;
  onApply: (preacherName: string | null) => void;
};

export default function AdvancedFilterSheet({
  open,
  onClose,
  preachers,
  activePreacher,
  onApply
}: Props) {
  const [selected, setSelected] = useState<string | typeof ALL_KEY>(
    activePreacher ?? ALL_KEY
  );

  useEffect(() => {
    if (open) setSelected(activePreacher ?? ALL_KEY);
  }, [open, activePreacher]);

  const handleReset = () => setSelected(ALL_KEY);

  const handleApply = () => {
    onApply(selected === ALL_KEY ? null : selected);
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="상세 필터">
      <section className={styles.section}>
        <h3 className={styles.section_title}>설교자</h3>
        <div className={styles.chips}>
          <button
            type="button"
            className={clsx(styles.chip, selected === ALL_KEY && styles.chip_active)}
            onClick={() => setSelected(ALL_KEY)}
          >
            전체
          </button>
          {preachers.map((preacher) => (
            <button
              key={preacher.id}
              type="button"
              className={clsx(styles.chip, selected === preacher.name && styles.chip_active)}
              onClick={() => setSelected(preacher.name)}
            >
              {preacher.name}
            </button>
          ))}
        </div>
      </section>

      <div className={styles.footer}>
        <button type="button" className={styles.btn_reset} onClick={handleReset}>
          초기화
        </button>
        <button type="button" className={styles.btn_apply} onClick={handleApply}>
          적용
        </button>
      </div>
    </BottomSheet>
  );
}
