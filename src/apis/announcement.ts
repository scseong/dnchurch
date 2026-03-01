import { createServerSideClient } from '@/lib/supabase/server';
import { PostType, ProfileType } from '@/types/common';

const POSTS_BUCKET = 'posts-dev';

export type AnnouncementWithProfile = PostType & {
  profiles: Pick<ProfileType, 'user_name'> | null;
};

export const getAnnouncement = async () => {
  const supabase = await createServerSideClient();
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
