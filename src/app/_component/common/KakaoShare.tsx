'use client';

declare global {
  interface Window {
    Kakao: any;
  }
}

type KakaoShareBtn = {
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
};

export default function KakaoShareBtn({
  title,
  description,
  imageUrl = '/images/dnchurch.png',
  link
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

  return (
    <button onClick={handleClick}>
      {/* <img
        src="/images/icon-kakaotalk.png"
        alt="카카오톡 공유하기"
        style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'contain' }}
      /> */}
      공유하기
    </button>
  );
}
