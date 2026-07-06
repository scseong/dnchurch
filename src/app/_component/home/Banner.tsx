import HeroCarousel, { type HeroSlide } from './HeroCarousel';

// 히어로 캐러셀 더미 데이터 — 운영 전 표시용. (admin이 site_settings로 운영 데이터를 넣으면 후속에서 연결)
const SLIDES: HeroSlide[] = [
  {
    eyebrow: '환영합니다',
    title: '대구동남교회',
    lines: ['함께 예배하고 함께 자라는 공동체', '처음 오신 분도 언제나 환영합니다.'],
    tone: 'welcome',
    ctas: [
      { label: '교회 소개', href: '/about', variant: 'primary' },
      { label: '지난 설교', href: '/sermons', variant: 'ghost' }
    ]
  },
  {
    eyebrow: '함께 드리는 예배',
    title: '주일에 만나요',
    lines: ['주일 오전 11시 · 수요 저녁 7시', '온 성도가 함께 모입니다.'],
    tone: 'worship',
    ctas: [{ label: '예배 안내', href: '/about/worship', variant: 'primary' }]
  },
  {
    eyebrow: '처음 오시나요?',
    title: '편하게 오세요',
    lines: ['복장도, 절차도 부담 없이.', '오시면 끝까지 안내해 드릴게요.'],
    tone: 'visit',
    ctas: [{ label: '방문 안내', href: '/about/welcome', variant: 'primary' }]
  }
];

export default function Banner() {
  return <HeroCarousel slides={SLIDES} />;
}
