import type { SitemapItem } from '@/types/layout';

export const sitemap: SitemapItem[] = [
  {
    path: '/about',
    label: '교회소개',
    title: '교회소개',
    description: '동남교회를 소개합니다',
    heroImageId: 'bible_qfgnyq',
    inNav: true,
    children: [
      {
        path: '/about/vision',
        label: '교회의 비전',
        title: '교회의 비전',
        description: '동남교회가 걸어가는 믿음의 방향을 나눕니다',
        heroImageId: 'bible_qfgnyq'
      },
      {
        path: '/about/serving-people',
        label: '섬기는 이',
        title: '섬기는 이',
        description: '교회를 위해 헌신하는 분들을 소개합니다',
        heroImageId: 'bible_qfgnyq'
      },
      {
        path: '/about/worship',
        label: '예배안내',
        title: '예배안내',
        description: '예배 시간과 장소를 안내해 드립니다',
        heroImageId: 'bible_qfgnyq'
      },
      {
        path: '/about/directions',
        label: '오시는 길',
        title: '오시는 길',
        description: '동남교회로 오시는 방법을 안내해 드립니다',
        heroImageId: 'bible_qfgnyq'
      }
    ]
  },
  {
    path: '/news',
    label: '교회소식',
    title: '교회소식',
    description: '동남교회의 새로운 소식을 전합니다',
    heroImageId: 'bible_qfgnyq',
    inNav: true,
    children: [
      {
        path: '/news/bulletin',
        label: '주보',
        title: '주보',
        description: '이번 주 주보를 확인하세요',
        heroImageId: 'bible_qfgnyq'
      },
      {
        path: '/news/announcement',
        label: '공지사항',
        title: '공지사항',
        description: '교회의 공지사항을 확인하세요',
        heroImageId: 'bible_qfgnyq'
      },
      {
        path: '/news/family-worship',
        label: '가정예배순서지',
        title: '가정예배순서지',
        description: '가정에서 드리는 예배를 위한 순서지입니다',
        heroImageId: 'bible_qfgnyq'
      }
    ]
  },
  {
    path: '/fellowship',
    label: '교제',
    title: '교제',
    description: '성도들과 함께하는 아름다운 교제의 공간입니다',
    heroImageId: 'bible_qfgnyq',
    inNav: true
  },
  {
    path: '/gallery',
    label: '동남앨범',
    title: '동남앨범',
    description: '동남교회의 소중한 순간들을 담았습니다',
    heroImageId: 'bible_qfgnyq',
    inNav: true
  },
  {
    path: '/login',
    label: '로그인',
    title: '로그인',
    description: '',
    heroImageId: '',
    inNav: false
  },
  {
    path: '/mypage',
    label: '마이페이지',
    title: '마이페이지',
    description: '',
    heroImageId: '',
    inNav: false
  }
];
