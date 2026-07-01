'use client';

import {
  IoLinkOutline,
  IoLogoFacebook,
  IoMailOutline
} from 'react-icons/io5';
import { BottomSheet } from '@/components/ui';
import useKakaoShare from '@/hooks/useKakaoShare';
import { useToastStore } from '@/store/toast.store';
import styles from './ShareSheet.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
};

/** 현재 페이지의 메타(title·description·og:image)를 읽어 공유 데이터로 쓴다 — 특정 페이지에 묶이지 않는다. */
function readMeta(selector: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  return document.querySelector(selector)?.getAttribute('content') ?? undefined;
}

/** 헤더 공유 버튼이 여는 공유 시트 — 링크 복사·카카오·페이스북·이메일. */
export default function ShareSheet({ open, onClose }: Props) {
  const { info, error } = useToastStore();
  const { share: shareToKakao } = useKakaoShare();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      info('링크가 복사되었습니다');
    } catch {
      error('링크 복사에 실패했습니다');
    }
    onClose();
  };

  const handleKakaoShare = () => {
    shareToKakao({
      title: typeof document !== 'undefined' ? document.title : '',
      description: readMeta('meta[name="description"]'),
      imageUrl: readMeta('meta[property="og:image"]')
    });
    onClose();
  };

  const handleFacebookShare = () => {
    const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      window.location.href
    )}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500');
    onClose();
  };

  const handleEmailShare = () => {
    const title = typeof document !== 'undefined' ? document.title : '';
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(window.location.href);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    onClose();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="공유">
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
  );
}
