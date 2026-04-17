'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './SermonNoteEditor.module.scss';

const NOTE_PREFIX = 'sermon-note-';
const DEBOUNCE_MS = 500;

type Props = {
  sermonId: string;
};

function loadNote(sermonId: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return window.localStorage.getItem(`${NOTE_PREFIX}${sermonId}`) ?? '';
  } catch {
    return '';
  }
}

function saveNote(sermonId: string, content: string) {
  try {
    window.localStorage.setItem(`${NOTE_PREFIX}${sermonId}`, content);
  } catch {
    /* ignore */
  }
}

export default function SermonNoteEditor({ sermonId }: Props) {
  const [note, setNote] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setNote(loadNote(sermonId));
  }, [sermonId]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setNote(value);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => saveNote(sermonId, value), DEBOUNCE_MS);
    },
    [sermonId]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className={styles.editor}>
      <textarea
        className={styles.textarea}
        value={note}
        onChange={handleChange}
        placeholder="설교를 들으며 메모를 남겨보세요..."
        rows={8}
      />
      <p className={styles.hint}>노트는 이 브라우저에 자동 저장됩니다</p>
    </div>
  );
}
