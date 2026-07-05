'use client';

import { useCallback } from 'react';
import { IoLinkOutline, IoDownloadOutline } from 'react-icons/io5';
import useKakaoShare from '@/hooks/useKakaoShare';
import { useToastStore } from '@/store/toast.store';
import styles from './BulletinShareCard.module.scss';

type Props = {
  title: string;
  imageUrl?: string;
  files: { filename: string; downloadUrl: string }[];
};

const SHARE_DESCRIPTION = '이번 주 교회 주보에서 예배 일정과 소식을 살펴보세요.';

/** 상세 본문의 '이 주보 공유하기' 카드 — 카카오톡·링크 복사·이미지 저장. 헤더 공유 버튼과 별개(목업 일치). */
export default function BulletinShareCard({ title, imageUrl, files }: Props) {
  const { info, error } = useToastStore();
  const { share: shareToKakao } = useKakaoShare();

  const handleKakao = useCallback(() => {
    shareToKakao({ title: `${title} | 대구동남교회`, description: SHARE_DESCRIPTION, imageUrl });
  }, [shareToKakao, title, imageUrl]);

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      info('주보 링크를 복사했어요');
    } catch {
      error('링크 복사에 실패했어요');
    }
  }, [info, error]);

  const handleSave = useCallback(async () => {
    if (files.length === 0) return;

    // 모바일은 한 제스처당 다운로드 1개만 허용해 여러 장이 안 내려간다.
    // 터치 기기에서 Web Share가 되면 이미지를 파일로 모아 공유 시트로 넘겨 '사진에 저장'으로 한 번에 저장한다.
    const canUseShare = navigator.maxTouchPoints > 0 && typeof navigator.canShare === 'function';

    if (canUseShare) {
      try {
        const shareFiles = await Promise.all(
          files.map(async ({ downloadUrl, filename }) => {
            const blob = await (await fetch(downloadUrl)).blob();
            return new File([blob], filename, { type: blob.type || 'image/jpeg' });
          })
        );
        if (navigator.canShare({ files: shareFiles })) {
          await navigator.share({ files: shareFiles, title });
          return;
        }
      } catch (shareError) {
        // 사용자가 공유 시트를 닫으면 AbortError — 조용히 끝낸다. 그 외 오류는 아래 다운로드로 폴백.
        if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      }
    }

    // 데스크톱·미지원: 파일마다 간격을 둬 다중 다운로드(연속 동기 클릭은 하나로 합쳐진다).
    files.forEach(({ downloadUrl, filename }, index) => {
      setTimeout(() => {
        const anchor = document.createElement('a');
        anchor.href = downloadUrl;
        anchor.download = filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }, index * 300);
    });
    info(`주보 이미지 ${files.length}장을 저장했어요`);
  }, [files, title, info]);

  return (
    <section className={styles.card}>
      <h2 className={styles.title}>이 주보 공유하기</h2>
      <p className={styles.subtitle}>가족·구역 채팅방에 바로 나눠보세요.</p>
      <div className={styles.actions}>
        <button type="button" className={styles.action} onClick={handleKakao}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 3.2C6.8 3.2 2.6 6.6 2.6 10.7c0 2.6 1.8 4.9 4.4 6.2-.2.7-.7 2.5-.8 2.9-.1.5.2.5.4.4.2-.1 2.4-1.6 3.4-2.3.5.1 1.1.1 1.6.1 5.2 0 9.4-3.3 9.4-7.4S17.2 3.2 12 3.2z" />
          </svg>
          카카오톡
        </button>
        <button type="button" className={styles.action} onClick={handleCopyLink}>
          <IoLinkOutline aria-hidden="true" />
          링크 복사
        </button>
        <button
          type="button"
          className={styles.action}
          onClick={handleSave}
          disabled={files.length === 0}
        >
          <IoDownloadOutline aria-hidden="true" />
          이미지 저장
        </button>
      </div>
    </section>
  );
}
