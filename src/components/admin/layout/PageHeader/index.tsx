'use client';

import { ReactNode } from 'react';
import clsx from 'clsx';
import styles from './index.module.scss';

interface PageHeaderAction {
  label: string;
  variant?: 'outline' | 'pri';
  icon?: ReactNode;
  onClick?: () => void;
}

interface PageHeaderProps {
  eyebrow?: string;
  badge?: string;
  title: string;
  description?: string;
  actions?: PageHeaderAction[];
}

export default function PageHeader({
  eyebrow,
  badge,
  title,
  description,
  actions
}: PageHeaderProps) {
  return (
    <header className={styles.wrapper}>
      <div className={styles.head}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <div className={styles.title_row}>
          <h1 className={styles.title}>{title}</h1>
          {badge && <span className={styles.badge}>{badge}</span>}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className={styles.actions}>
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={clsx(styles.btn, styles[action.variant ?? 'outline'])}
              onClick={action.onClick}
            >
              {action.icon && <span className={styles.btn_icon}>{action.icon}</span>}
              {action.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}
