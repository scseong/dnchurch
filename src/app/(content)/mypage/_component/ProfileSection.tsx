'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import type { ProfileType } from '@/types/common';
import ProfileEditModal from './ProfileEditModal';
import styles from './mypage.module.scss';

export default function ProfileSection({ profile }: { profile: ProfileType }) {
  const [editOpen, setEditOpen] = useState(false);
  const displayName = profile.display_name || profile.name;
  const avatarSrc = profile.avatar_url ? cloudinaryFetchUrl(profile.avatar_url) : null;

  return (
    <section className={styles.profile} aria-label="내 프로필">
      <span className={styles.avatar} aria-hidden="true">
        {avatarSrc ? (
          <CloudinaryImage
            src={avatarSrc}
            alt=""
            fill
            sizes="64px"
            cropMode="fill"
            gravity="face"
            aspectRatio="1:1"
          />
        ) : (
          displayName.charAt(0)
        )}
      </span>
      <div className={styles.identity}>
        <strong className={styles.name}>{displayName}</strong>
        <span className={styles.email}>{profile.email}</span>
      </div>
      <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
        프로필 편집
      </Button>
      <ProfileEditModal profile={profile} open={editOpen} onClose={() => setEditOpen(false)} />
    </section>
  );
}
