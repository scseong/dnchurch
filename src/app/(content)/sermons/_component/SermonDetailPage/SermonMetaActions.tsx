'use client';

import { useEffect, useState } from 'react';
import clsx from 'clsx';
import {
  IoHeart,
  IoHeartOutline,
  IoLinkOutline,
  IoLogoFacebook,
  IoMailOutline,
  IoShareSocialOutline
} from 'react-icons/io5';
import { BottomSheet } from '@/components/ui';
import useKakaoShare from '@/hooks/useKakaoShare';
import { useToastStore } from '@/store/toast.store';
import styles from './SermonDetailPage.module.scss';

const BOOKMARK_STORAGE_KEY = 'bookmarked-sermons';

type Props = {
  sermonId: string;
  title: string;
  description?: string;
  shareImageUrl?: string;
};

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

export default function SermonMetaActions({
  sermonId,
  title,
  description,
  shareImageUrl
}: Props) {
  const { info, error } = useToastStore();
  const { share: shareToKakao } = useKakaoShare();
  const [shareOpen, setShareOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    setBookmarked(loadBookmarkedSermonIds().includes(sermonId));
  }, [sermonId]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      info('링크가 복사되었습니다');
    } catch {
      error('링크 복사에 실패했습니다');
    }
    setShareOpen(false);
  };

  const handleKakaoShare = () => {
    shareToKakao({ title, description, imageUrl: shareImageUrl });
    setShareOpen(false);
  };

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    setShareOpen(false);
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(window.location.href);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setShareOpen(false);
  };

  const handleToggleBookmark = () => {
    const current = loadBookmarkedSermonIds();
    const next = bookmarked
      ? current.filter((id) => id !== sermonId)
      : [...current, sermonId];
    saveBookmarkedSermonIds(next);
    setBookmarked(!bookmarked);
    info(bookmarked ? '저장이 해제되었습니다' : '저장되었습니다');
  };

  return (
    <div className={styles.meta_actions}>
      <button
        type="button"
        className={styles.pill}
        onClick={() => setShareOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={shareOpen}
      >
        <IoShareSocialOutline aria-hidden="true" />
        <span>공유</span>
      </button>
      <button
        type="button"
        className={clsx(styles.pill, bookmarked && styles.pill_active)}
        onClick={handleToggleBookmark}
        aria-pressed={bookmarked}
      >
        {bookmarked ? (
          <IoHeart aria-hidden="true" />
        ) : (
          <IoHeartOutline aria-hidden="true" />
        )}
        <span>저장</span>
      </button>
      <BottomSheet
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        title="공유"
      >
        <div className={styles.share_list}>
          <button
            type="button"
            className={styles.share_item}
            onClick={handleCopyLink}
            aria-label="링크 복사"
          >
            <IoLinkOutline aria-hidden="true" />
            <span>링크 복사</span>
          </button>
          <button
            type="button"
            className={styles.share_item}
            onClick={handleKakaoShare}
            aria-label="카카오톡으로 공유"
          >
            <img src="/images/icon-kakaotalk.png" alt="" width={18} height={18} />
            <span>카카오톡</span>
          </button>
          <button
            type="button"
            className={styles.share_item}
            onClick={handleFacebookShare}
            aria-label="페이스북으로 공유"
          >
            <IoLogoFacebook aria-hidden="true" />
            <span>페이스북</span>
          </button>
          <button
            type="button"
            className={styles.share_item}
            onClick={handleEmailShare}
            aria-label="이메일로 공유"
          >
            <IoMailOutline aria-hidden="true" />
            <span>이메일</span>
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
