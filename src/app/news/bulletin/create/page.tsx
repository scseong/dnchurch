'use client';

import { useActionState } from 'react';
import { createBulletinAction } from '@/actions/bulletin/bulletin.action';
import { useProfile } from '@/context/SessionContextProvider';

export default function Page() {
  const user = useProfile();
  const [state, formAction, isPending] = useActionState(createBulletinAction, null);
  console.log('state >> ', state);

  if (!user) return;

  return (
    <section>
      <form action={formAction}>
        <label htmlFor="title">제목</label>
        <input name="title" placeholder="2025년 1월 5일 첫째 주" />

        <input name="user_id" value={user.id} hidden readOnly />

        <input id="image_url" name="image_url" type="file" accept="image/*" multiple />
        <button disabled={isPending}>생성</button>
      </form>
    </section>
  );
}
