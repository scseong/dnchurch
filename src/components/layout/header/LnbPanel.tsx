'use client';

import styles from './LnbPanel.module.scss';

type Props = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

// 배경 전용 패널 (border-top + box-shadow)
// depth2 콘텐츠는 DesktopNav 각 <li> 내부에서 렌더링됨
export default function LnbPanel({ onMouseEnter, onMouseLeave }: Props) {
  return (
    <div className={styles.panel} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} />
  );
}
