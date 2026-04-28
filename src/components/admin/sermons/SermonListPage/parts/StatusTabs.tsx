'use client';

import clsx from 'clsx';
import styles from '../index.module.scss';

export type SermonStatus = 'all' | 'published' | 'draft' | 'scheduled';

interface StatusTabsProps {
  activeStatus: SermonStatus;
  counts: Record<SermonStatus, number>;
  onChange: (status: SermonStatus) => void;
}

const TABS: { value: SermonStatus; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'published', label: '발행' },
  { value: 'draft', label: '초안' },
  { value: 'scheduled', label: '예약' }
];

export default function StatusTabs({ activeStatus, counts, onChange }: StatusTabsProps) {
  return (
    <div className={styles.status_tabs}>
      {TABS.map((tab) => {
        const isActive = activeStatus === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            className={clsx(styles.tab, isActive && styles.tab_active)}
            onClick={() => onChange(tab.value)}
          >
            {tab.value !== 'all' && <span className={clsx(styles.dot, styles[tab.value])} />}
            <span>{tab.label}</span>
            <span className={styles.count}>{counts[tab.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
