'use client';

import { FiShare2 } from 'react-icons/fi';

declare global {
  interface Window {
    Kakao: any;
  }
}

type KakaoShareBtn = {
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  size?: string;
};

export default function KakaoShareBtn({
  title,
  description,
  imageUrl = '/images/dnchurch.png',
  link,
  size
}: KakaoShareBtn) {
  const handleClick = () => {
    const { Kakao, location } = window;
    const requestUrl = link ?? location.href;

    if (!Kakao) return;

    Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title,
        imageUrl,
        description,
        link: {
          mobileWebUrl: requestUrl,
          webUrl: requestUrl
        }
      },
      buttons: [
        {
          title: '주보 보기',
          link: {
            mobileWebUrl: requestUrl,
            webUrl: requestUrl
          }
        }
      ]
    });
  };

  /* TODO: 이미지로 변경 */
  return (
    <button onClick={handleClick}>
      <FiShare2 size={size} />
    </button>
  );
}
