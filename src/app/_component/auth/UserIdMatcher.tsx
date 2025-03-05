'use client';

import { useProfile } from '@/context/SessionContextProvider';

export default function UserIdMatcher({
  userId,
  children
}: {
  userId: string;
  children: React.ReactNode;
}) {
  const profile = useProfile();

  if (!profile || profile.id !== userId) return null;

  return <>{children}</>;
}
