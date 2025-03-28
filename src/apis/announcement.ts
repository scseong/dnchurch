import { createServerSideClient } from '@/shared/supabase/server';
import { PostType, ProfileType } from '@/shared/types/types';

const POSTS_BUCKET = 'posts-dev';

export type AnnouncementWithProfile = PostType & {
  profiles: Pick<ProfileType, 'user_name'> | null;
};

export const getAnnouncement = async () => {
  const supabase = await createServerSideClient({ cache: 'force-cache', tag: 'announcement' });
  const {
    data: posts,
    count,
    error
  } = await supabase
    .from(POSTS_BUCKET)
    .select(`*, profiles (user_name)`, { count: 'exact' })
    .order('id', { ascending: false });

  if (error) console.error(error);

  return { posts, count: count ?? 0 };
};
