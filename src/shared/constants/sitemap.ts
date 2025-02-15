import {
  PiChurch,
  PiNewspaperClipping,
  PiWechatLogo,
  PiImages,
  PiSignIn,
  PiUserCircle
} from 'react-icons/pi';

export const sitemap = [
  {
    path: '/about',
    label: '교회소개',
    icon: PiChurch,
    subPath: [
      { path: '/about/vision', label: '교회의 비전' },
      { path: '/about/serving-people', label: '섬기는 이' },
      { path: '/about/worship', label: '예배안내' },
      { path: '/about/directions', label: '오시는 길' }
    ],
    show: true
  },
  {
    path: '/news',
    label: '교회소식',
    icon: PiNewspaperClipping,
    subPath: [
      { path: '/news/bulletin', label: '주보' },
      { path: '/news/announcement', label: '공지사항' },
      { path: '/news/family-worship', label: '가정예배순서지' }
    ],
    show: true
  },
  { path: '/fellowship', label: '교제', icon: PiWechatLogo, show: true },
  { path: '/gallery', label: '동남앨범', icon: PiImages, show: true },
  { path: '/login', label: '로그인', icon: PiSignIn, show: false },
  { path: '/mypage', label: '마이페이지', icon: PiUserCircle, show: false }
];
