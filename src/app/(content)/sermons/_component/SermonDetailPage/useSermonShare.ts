import { useState } from 'react';
import useKakaoShare from '@/hooks/useKakaoShare';
import { useToastStore } from '@/store/toast.store';

type ShareParams = {
  title: string;
  description?: string;
  shareImageUrl?: string;
};

type SermonShare = {
  shareOpen: boolean;
  setShareOpen: (open: boolean) => void;
  handleCopyLink: () => Promise<void>;
  handleKakaoShare: () => void;
  handleFacebookShare: () => void;
  handleEmailShare: () => void;
};

/** 공유 BottomSheet 열림 상태와 링크 복사·카카오·페이스북·이메일 공유 핸들러 */
export function useSermonShare({ title, description, shareImageUrl }: ShareParams): SermonShare {
  const { info, error } = useToastStore();
  const { share: shareToKakao } = useKakaoShare();
  const [shareOpen, setShareOpen] = useState(false);

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

  return {
    shareOpen,
    setShareOpen,
    handleCopyLink,
    handleKakaoShare,
    handleFacebookShare,
    handleEmailShare
  };
}
