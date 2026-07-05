import type { GalleryPost, GalleryPhoto } from '../_types';

// mock 사진 — Unsplash 원격 URL. 렌더 시 Cloudinary image/fetch로 감싼다(로더 관례 유지).
// 실제 스키마·업로드 연동은 후속 단계. 아래 id는 fetch 200 확인 완료.
const photo = (id: string, width = 1600, height = 1067): GalleryPhoto => ({
  remoteUrl: `https://images.unsplash.com/photo-${id}?w=1600&q=80`,
  width,
  height
});

export const GALLERY_POSTS: GalleryPost[] = [
  {
    id: 'p1',
    authorName: '김은혜',
    avatarInitial: '김',
    avatarColor: '#C08552',
    department: '청년부',
    category: '청년부',
    createdLabel: '2시간 전',
    text: '오늘 청년예배, 오랜만에 다 같이 목소리 모아 찬양하는데 마음이 뜨거워졌어요. 함께라서 감사한 저녁이었습니다.',
    photos: [photo('1511632765486-a01980e01a18')],
    reactions: { 은혜: 42, 아멘: 18, 기도해요: 7, 축복: 4 },
    viewerReaction: '은혜',
    commentCount: 3,
    topComment: {
      authorName: '박믿음',
      avatarInitial: '박',
      avatarColor: '#A9713B',
      text: '저도 그 자리에 있었는데 정말 은혜로웠어요'
    }
  },
  {
    id: 'p2',
    authorName: '이든',
    avatarInitial: '이',
    avatarColor: '#6B8E5A',
    department: '봉사팀',
    category: '봉사',
    createdLabel: '어제',
    text: '토요일 이른 아침, 교회 주변을 함께 쓸고 닦았습니다. 손발은 바빴지만 마음은 넉넉했던 시간이었어요.',
    photos: [photo('1438032005730-c779502df39b'), photo('1445019980597-93fa8acb246c')],
    reactions: { 은혜: 51, 아멘: 12, 기도해요: 6, 축복: 23 },
    viewerReaction: '축복',
    commentCount: 5,
    topComment: {
      authorName: '정소망',
      avatarInitial: '정',
      avatarColor: '#9C6B4E',
      text: '수고 많으셨어요! 다음엔 저도 함께할게요'
    }
  },
  {
    id: 'p3',
    authorName: '최소망',
    avatarInitial: '최',
    avatarColor: '#B0975F',
    department: '다음세대',
    category: '다음세대',
    createdLabel: '2일 전',
    text: '주일학교 아이들과 함께한 여름 성경학교 첫날. 웃음소리가 예배당을 가득 채웠습니다.',
    photos: [photo('1470225620780-dba8ba36b745')],
    reactions: { 은혜: 19, 아멘: 6, 기도해요: 14, 축복: 3 },
    viewerReaction: '기도해요',
    commentCount: 2,
    topComment: {
      authorName: '한사랑',
      avatarInitial: '한',
      avatarColor: '#7C8B54',
      text: '아이들 표정이 너무 밝아요 🙂'
    }
  },
  {
    id: 'p4',
    authorName: '정한결',
    avatarInitial: '정',
    avatarColor: '#8A6D4B',
    department: '찬양팀',
    category: '주일예배',
    createdLabel: '3일 전',
    text: '주일 대예배 찬양 연습. 한 소절 한 소절 맞춰가며 드릴 예배를 준비했습니다. 이번 주도 은혜로 채워지길.',
    photos: [
      photo('1519681393784-d120267933ba'),
      photo('1506905925346-21bda4d32df4'),
      photo('1529070538774-1843cb3265df')
    ],
    reactions: { 은혜: 33, 아멘: 27, 기도해요: 9, 축복: 11 },
    viewerReaction: '아멘',
    commentCount: 8,
    topComment: {
      authorName: '김찬양',
      avatarInitial: '김',
      avatarColor: '#B67C4B',
      text: '연습 소리만 들어도 벌써 은혜받아요'
    }
  },
  {
    id: 'p5',
    authorName: '한지혜',
    avatarInitial: '한',
    avatarColor: '#A57C55',
    department: '교육부',
    category: '나눔',
    createdLabel: '4일 전',
    text: '구역 나눔 모임에서 각자 준비한 음식을 나눴어요. 소박한 상 위에 감사가 넘쳤습니다.',
    photos: [
      photo('1507692049790-de58290a4334'),
      photo('1490730141103-6cac27aaab94'),
      photo('1533174072545-7a4b6ad7a6c3'),
      photo('1428765048792-aa4bdde46fea')
    ],
    reactions: { 은혜: 24, 아멘: 8, 기도해요: 5, 축복: 16 },
    viewerReaction: null,
    commentCount: 1,
    topComment: {
      authorName: '오은총',
      avatarInitial: '오',
      avatarColor: '#96693F',
      text: '다음 모임이 벌써 기다려집니다'
    }
  },
  {
    id: 'p6',
    authorName: '오평강',
    avatarInitial: '오',
    avatarColor: '#7A6654',
    department: '중보기도팀',
    category: '기도',
    createdLabel: '지난주',
    text: '새벽 중보기도 모임. 조용한 예배당에서 함께 무릎 꿇는 시간이 가장 큰 힘이 됩니다.',
    photos: [photo('1519681393784-d120267933ba')],
    reactions: { 은혜: 15, 아멘: 21, 기도해요: 30, 축복: 6 },
    viewerReaction: '기도해요',
    commentCount: 0,
    topComment: null
  }
];
