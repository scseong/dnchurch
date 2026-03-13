import { createServerSideClient } from '@/lib/supabase/server';
import { NoticeType, ProfileType } from '@/types/common';

const NOTICES_TABLE = 'notices';

export type AnnouncementWithProfile = NoticeType & {
  profiles: Pick<ProfileType, 'display_name'> | null;
};

export const getAnnouncement = async () => {
  const supabase = await createServerSideClient();
  const {
    data: posts,
    count,
    error
  } = await supabase
    .from(NOTICES_TABLE)
    .select(`*, profiles (display_name)`, { count: 'exact' })
    .is('deleted_at', null)
    .eq('is_public', true)
    .order('id', { ascending: false });

  if (error) console.error(error);

  return { posts, count: count ?? 0 };
};
