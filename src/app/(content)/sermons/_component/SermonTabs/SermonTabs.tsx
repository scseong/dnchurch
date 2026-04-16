'use client';

import clsx from 'clsx';
import styles from './SermonTabs.module.scss';

type Tab = {
  key: string;
  label: string;
};

type Props = {
  activeTab: string;
  onTabChange: (key: string) => void;
  tabs: Tab[];
};

export default function SermonTabs({ activeTab, onTabChange, tabs }: Props) {
  return (
    <div className={styles.tab_bar} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          className={clsx(styles.tab, activeTab === tab.key && styles.tab_active)}
          aria-selected={activeTab === tab.key}
          tabIndex={activeTab === tab.key ? 0 : -1}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
