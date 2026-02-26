import type { KakaoShareProps } from '@/types/kakao';

export default function useKakaoShare() {
  const share = ({
    title,
    description,
    imageUrl,
    link,
    buttonTitle = '자세히 보기',
    objectType = 'feed'
  }: KakaoShareProps) => {
    if (typeof window === 'undefined') return;

    const { Kakao, location } = window;
    if (!Kakao || !Kakao.Share) return;

    const requestUrl = link ?? location.href;

    Kakao.Share.sendDefault({
      objectType,
      content: {
        title,
        description,
        imageUrl,
        link: {
          mobileWebUrl: requestUrl,
          webUrl: requestUrl
        }
      },
      buttons: [
        {
          title: buttonTitle,
          link: {
            mobileWebUrl: requestUrl,
            webUrl: requestUrl
          }
        }
      ]
    });
  };

  return { share };
}
