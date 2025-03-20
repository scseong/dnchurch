'use client';

import Link from 'next/link';
import { useProfile } from '@/context/SessionContextProvider';
import styles from './CreateBulletinButton.module.scss';

export default function CreateBulletinButton() {
  const user = useProfile();

  if (!user || !user.is_admin) return null;

  return (
    <div className={styles.wrap}>
      <Link href="/news/bulletin/create">주보 작성</Link>
    </div>
  );
}
