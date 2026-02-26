import { Tables } from '@/types/database.types';

export type ProfileType = Tables<'profiles'>;
export type BulletinType = Tables<'bulletin'>;
export type PostType = Tables<'posts'>;

export type NextCacheOptions = {
  tags?: string[];
  revalidate?: false | 0 | number;
  cache?: RequestCache;
};

export type ImageFile = {
  file: File;
  previewUrl: string;
};
