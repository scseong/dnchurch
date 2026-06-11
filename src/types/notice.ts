import { Tables, Database } from '@/types/database.types';
import type { NoticeSortOption } from '@/constants/notice';

export type NoticeType = Tables<'notices'>;
export type NoticeCategory = Database['public']['Enums']['notice_category_enum'];

// drawer가 실제로 읽는 필드만 — RSC payload에 전체 row 중복 직렬화 방지 (Codex 설계 검증 후속)
export type NoticeDrawerItem = Pick<
  NoticeType,
  'id' | 'title' | 'category' | 'content' | 'created_at' | 'view_count' | 'attachment_url'
>;

export interface TipTapContent {
  type: 'doc';
  content: TipTapNode[];
}

export interface TipTapNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  text?: string;
}

export interface TipTapMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export type CreateNoticeDto = Pick<
  NoticeType,
  'title' | 'category' | 'content' | 'is_pinned' | 'is_public'
> & { author_id: string };

export type UpdateNoticeDto = Partial<CreateNoticeDto>;

export interface NoticeListParams {
  category?: NoticeCategory;
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: NoticeSortOption;
}
