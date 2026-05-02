'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import {
  IoBookmark,
  IoBookmarkOutline,
  IoShareOutline,
  IoSpeedometerOutline,
  IoTvOutline
} from 'react-icons/io5';
import { useToastStore } from '@/store/toast.store';
import styles from './SermonVideoTools.module.scss';

const BOOKMARK_KEY = 'bookmarked-sermons';
const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;
const DEFAULT_SPEED = 1;

type Props = {
  sermonId: string;
  onSpeedChange?: (speed: number) => void;
};

function loadBookmarks(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

function saveBookmarks(list: string[]) {
  try {
    window.localStorage.setItem(BOOKMARK_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export default function SermonVideoTools({ sermonId, onSpeedChange }: Props) {
  const { info } = useToastStore();
  const [speedOpen, setSpeedOpen] = useState(false);
  const [speed, setSpeed] = useState<number>(DEFAULT_SPEED);
  const [bookmarked, setBookmarked] = useState(false);
  const speedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = loadBookmarks();
    queueMicrotask(() => setBookmarked(list.includes(sermonId)));
  }, [sermonId]);

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

  const handleBookmark = () => {
    const list = loadBookmarks();
    const next = bookmarked
      ? list.filter((id) => id !== sermonId)
      : [...list, sermonId];
    saveBookmarks(next);
    setBookmarked(!bookmarked);
    info(bookmarked ? '북마크가 해제되었습니다' : '북마크에 저장되었습니다');
  };

  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      await navigator.clipboard.writeText(url);
      info('링크가 복사되었습니다');
    } catch {
      info('링크 복사에 실패했습니다');
    }
  }, [info]);

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
                <button
                  type="button"
                  role="menuitem"
                  className={clsx(
                    styles.speed_option,
                    speed === value && styles.speed_option_active
                  )}
                  onClick={() => handleSpeedSelect(value)}
                >
                  {value}x
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button type="button" className={styles.tool} onClick={handlePip}>
        <IoTvOutline aria-hidden="true" />
        <span>PIP</span>
      </button>

      <button
        type="button"
        className={clsx(styles.tool, bookmarked && styles.tool_active)}
        onClick={handleBookmark}
        aria-pressed={bookmarked}
      >
        {bookmarked ? <IoBookmark aria-hidden="true" /> : <IoBookmarkOutline aria-hidden="true" />}
        <span>북마크</span>
      </button>

      <button type="button" className={styles.tool} onClick={handleShare}>
        <IoShareOutline aria-hidden="true" />
        <span>공유</span>
      </button>
    </div>
  );
}
