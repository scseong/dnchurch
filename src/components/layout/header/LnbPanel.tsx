'use client';

import styles from './LnbPanel.module.scss';

type Props = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export default function LnbPanel({ onMouseEnter, onMouseLeave }: Props) {
  return <div className={styles.panel} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />;
}
