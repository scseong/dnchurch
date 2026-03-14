import { Tables } from '@/types/database.types';

export type ProfileType = Tables<'profiles'>;
export type BulletinType = Tables<'bulletins'>;
export type BulletinImageType = Tables<'bulletin_images'>;
export type NoticeType = Tables<'notices'>;

/** @deprecated Use NoticeType */
export type PostType = NoticeType;

export type NextCacheOptions = {
  tags?: string[];
  revalidate?: false | 0 | number;
  cache?: RequestCache;
};
