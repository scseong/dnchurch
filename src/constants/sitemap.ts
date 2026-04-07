import type { AppSitemapNode } from '@/types/layout';

export const sitemap: AppSitemapNode[] = [
  { path: '/', label: '대구동남교회' },
  {
    path: '/about',
    label: '교회 소개',
    children: [
      { path: '/about/welcome', label: '환영합니다' },
      { path: '/about/vision', label: '교회의 비전' },
      { path: '/about/pastor', label: '담임목사 인사말' },
      { path: '/about/worship', label: '예배안내' },
      { path: '/about/location', label: '오시는 길' }
    ]
  },
  {
    path: '/next-gen',
    label: '다음세대',
    children: [
      { path: '/next-gen/kindergarten', label: '유치부' },
      { path: '/next-gen/elementary', label: '유초등부' },
      { path: '/next-gen/youth', label: '중고등부' },
      { path: '/next-gen/young-adult', label: '청년부' }
    ]
  },
  {
    path: '/sermons',
    label: '설교',
    children: [{ path: '/sermons/:id', label: '설교 상세', detail: true }]
  },
  {
    path: '/community',
    label: '교제',
    children: [
      {
        path: '/community/prayer',
        label: '기도제목',
        children: [{ path: '/community/prayer/:id', label: '기도제목 상세', detail: true }]
      },
      {
        path: '/community/sharing',
        label: '은혜 나눔',
        children: [{ path: '/community/sharing/:id', label: '은혜 나눔 상세', detail: true }]
      },
      {
        path: '/community/groups',
        label: '소모임',
        children: [{ path: '/community/groups/:id', label: '소모임 상세', detail: true }]
      }
    ]
  },

  {
    path: '/news',
    label: '교회 소식',
    children: [
      {
        path: '/news/notices',
        label: '공지사항',
        children: [{ path: '/news/notices/:id', label: '공지사항 상세', detail: true }]
      },
      {
        path: '/news/bulletins',
        label: '주보',
        children: [{ path: '/news/bulletins/:id', label: '주보 상세', detail: true }]
      },
      {
        path: '/news/gallery',
        label: '갤러리',
        children: [{ path: '/news/gallery/:id', label: '갤러리 상세', detail: true }]
      }
    ]
  },
  {
    path: '/mypage',
    label: '마이페이지',
    children: [
      { path: '/mypage/profile', label: '프로필 편집' },
      { path: '/mypage/settings', label: '설정' }
    ]
  },
  { path: '/notifications', label: '알림' },
  { path: '/search', label: '검색' }
];
