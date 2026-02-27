'use client';

import useKakaoShare from '@/hooks/useKakaoShare';
import type { KakaoShareProps } from '@/types/kakao';

export default function KakaoShareButton(props: KakaoShareProps) {
  const { share } = useKakaoShare();

  return (
    <button onClick={() => share(props)} aria-label="카카오톡 공유하기" style={{ display: 'flex' }}>
      {props.children ?? (
        <img src="/images/icon-kakaotalk.png" alt="카카오톡 공유" width={40} height={40} />
      )}
    </button>
  );
}
