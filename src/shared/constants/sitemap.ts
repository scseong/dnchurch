export const sitemap = [
  {
    path: '/about',
    label: '교회소개',
    subPath: [
      { path: '/about/#serving_people', label: '섬기는 이' },
      { path: '/about/#worship_info', label: '예배안내' },
      { path: '/about/#directions', label: '오시는 길' }
    ],
    show: true
  },
  {
    path: '/news',
    label: '교회소식',
    subPath: [
      { path: '/news/announcement', label: '공지사항' },
      { path: '/news/bulletin', label: '주보' }
    ],
    show: true
  },
  { path: '/fellowship', label: '교제', show: true },
  { path: '/gallery', label: '동남앨범', show: true },
  { path: '/login', label: '로그인', show: false },
  { path: '/mypage', label: '마이페이지', show: false }
];
