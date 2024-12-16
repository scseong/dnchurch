import { User } from '@supabase/supabase-js';
import { Tables } from './database.types';

export type UserProps = UserWithCustomMetadata | null;

export type UserWithCustomMetadata = Omit<User, 'user_metadata'> & {
  user_metadata: UserMetadata;
};

export type UserMetadata = {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;
  name: string;
  phone_verified: boolean;
  preferred_username: string;
  provider_id: string;
  sub: string;
  user_name: string;
};

export type ProfileType = Tables<'profiles'>;
export type BulletinType = Tables<'bulletin'>;

export type SearchParams = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};
