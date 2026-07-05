// 갤러리 피드 읽기용 타입 — 참여형 스키마(docs/references/gallery)의 표시 필요분만 추린 축약본.
// 쓰기(작성·반응 토글·댓글)·모더레이션·업로드는 후속 단계라 여기 없다.

// 카테고리는 게시글 데이터에 남겨 스키마 충실도를 유지한다. 카테고리 필터 UI는 후속 단계라
// 지금은 export하지 않는다(GalleryCategory 타입 파생에만 쓰인다).
const GALLERY_CATEGORIES = ['주일예배', '청년부', '다음세대', '봉사', '나눔', '기도'] as const;

export type GalleryCategory = (typeof GALLERY_CATEGORIES)[number];

export const REACTION_TYPES = ['은혜', '아멘', '기도해요', '축복'] as const;

export type ReactionType = (typeof REACTION_TYPES)[number];

export type GalleryPhoto = {
  // 원격 스톡 URL(mock). 렌더 시 cloudinaryFetchUrl로 감싸 Cloudinary fetch 전송을 태운다.
  remoteUrl: string;
  width: number;
  height: number;
};

export type GalleryComment = {
  authorName: string;
  avatarInitial: string;
  avatarColor: string;
  text: string;
};

export type GalleryPost = {
  id: string;
  authorName: string;
  avatarInitial: string;
  avatarColor: string; // 성도별 아바타 배경색 — 스키마 Member.avatarColor(hex) 필드에 해당하는 데이터값
  department: string; // 표시용 소속 (예: 청년부, 봉사팀)
  category: GalleryCategory;
  createdLabel: string; // mock 상대 시각 (예: '2시간 전', '어제')
  text: string;
  photos: GalleryPhoto[];
  reactions: Record<ReactionType, number>;
  viewerReaction: ReactionType | null; // 강조할 반응 (mock)
  commentCount: number;
  topComment: GalleryComment | null;
};
