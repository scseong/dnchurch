import { useEffect, useState } from 'react';
import { useToastStore } from '@/store/toast.store';

const BOOKMARK_STORAGE_KEY = 'bookmarked-sermons';

function loadBookmarkedSermonIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((value): value is string => typeof value === 'string')
      : [];
  } catch {
    return [];
  }
}

function saveBookmarkedSermonIds(ids: string[]) {
  try {
    window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* localStorage 접근 실패 시 무시 */
  }
}

type SermonBookmark = {
  bookmarked: boolean;
  handleToggleBookmark: () => void;
};

/** localStorage 기반 설교 저장(북마크) 상태와 토글 */
export function useSermonBookmark(sermonId: string): SermonBookmark {
  const { info } = useToastStore();
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(loadBookmarkedSermonIds().includes(sermonId));
  }, [sermonId]);

  const handleToggleBookmark = () => {
    const current = loadBookmarkedSermonIds();
    const next = bookmarked
      ? current.filter((id) => id !== sermonId)
      : [...current, sermonId];
    saveBookmarkedSermonIds(next);
    setBookmarked(!bookmarked);
    info(bookmarked ? '저장이 해제되었습니다' : '저장되었습니다');
  };

  return { bookmarked, handleToggleBookmark };
}
