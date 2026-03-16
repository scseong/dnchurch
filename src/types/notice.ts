import { Tables, Database } from '@/types/database.types';
import type { NoticeSortOption } from '@/constants/notice';

export type NoticeType = Tables<'notices'>;
export type NoticeCategory = Database['public']['Enums']['notice_category_enum'];

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
