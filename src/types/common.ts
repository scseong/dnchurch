import { Tables } from '@/types/database.types';

export type ProfileType = Tables<'profiles'>;
/** 부서·구역 이름을 join한 프로필 (마이 페이지 표시용). */
export type ProfileWithOrg = ProfileType & {
  departments: { name: string } | null;
  districts: { name: string } | null;
};
/** 부서·구역 드롭다운 옵션. */
export type OrgOption = { id: number; name: string };
export type StaffType = Tables<'staff'>;
export type WorshipScheduleType = Tables<'worship_schedules'>;
export type BulletinType = Tables<'bulletins'>;
export type BulletinImageType = Tables<'bulletin_images'>;
export type NoticeType = Tables<'notices'>;
export type SiteCollectionType = Tables<'site_collections'>;

/** @deprecated Use NoticeType */
export type PostType = NoticeType;

export type NextCacheOptions = {
  tags?: string[];
  revalidate?: false | 0 | number;
  cache?: RequestCache;
};
