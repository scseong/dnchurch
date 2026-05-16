'use client';

import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import { IoSpeedometerOutline, IoTvOutline } from 'react-icons/io5';
import { ListItem } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import styles from './SermonVideoTools.module.scss';

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const DEFAULT_SPEED = 1;

type Props = {
  onSpeedChange?: (speed: number) => void;
};

export default function SermonVideoTools({ onSpeedChange }: Props) {
  const { info } = useToastStore();
  const [speedOpen, setSpeedOpen] = useState(false);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const speedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!speedOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (!speedRef.current?.contains(e.target as Node)) setSpeedOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [speedOpen]);

  const handleSpeedSelect = (value: number) => {
    setSpeed(value);
    setSpeedOpen(false);
    onSpeedChange?.(value);
    info(`재생 속도 ${value}x`);
  };

  const handlePip = () => {
    info('PIP 모드는 이 영상에서 지원되지 않습니다');
  };

  return (
    <div className={styles.tools} role="toolbar" aria-label="영상 도구">
      <div ref={speedRef} className={styles.tool_wrap}>
        <button
          type="button"
          className={clsx(styles.tool, speedOpen && styles.tool_active)}
          onClick={() => setSpeedOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={speedOpen}
        >
          <IoSpeedometerOutline aria-hidden="true" />
          <span>{speed}x</span>
        </button>
        {speedOpen && (
          <ul className={styles.speed_popup} role="menu">
            {SPEED_OPTIONS.map((value) => (
              <li key={value}>
                <ListItem
                  role="menuitem"
                  selected={speed === value}
                  onClick={() => handleSpeedSelect(value)}
                  className={styles.speed_option}
                >
                  {value}x
                </ListItem>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className={styles.tool} onClick={handlePip}>
        <IoTvOutline aria-hidden="true" />
        <span>PIP</span>
      </button>
    </div>
  );
}
