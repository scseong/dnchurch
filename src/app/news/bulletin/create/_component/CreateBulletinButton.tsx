'use client';

import { useProfile } from '@/context/SessionContextProvider';
import Link from 'next/link';

export default function CreateBulletinButton() {
  const user = useProfile();

  if (!user || !user.is_admin) return null;

  return <Link href="/news/bulletin/create">주보 작성</Link>;
}
