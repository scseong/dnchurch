'use client';

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
import { useSermonBookmark } from './useSermonBookmark';
import { useSermonShare } from './useSermonShare';
import styles from './SermonDetailPage.module.scss';

type Props = {
  sermonId: string;
  title: string;
  description?: string;
  shareImageUrl?: string;
};

export default function SermonMetaActions({
  sermonId,
  title,
  description,
  shareImageUrl
}: Props) {
  const { bookmarked, handleToggleBookmark } = useSermonBookmark(sermonId);
  const {
    shareOpen,
    setShareOpen,
    handleCopyLink,
    handleKakaoShare,
    handleFacebookShare,
    handleEmailShare
  } = useSermonShare({ title, description, shareImageUrl });

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
