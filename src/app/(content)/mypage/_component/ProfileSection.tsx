'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { cloudinaryFetchUrl } from '@/utils/cloudinary';
import type { ProfileWithOrg, OrgOption } from '@/types/common';
import ProfileEditModal from './ProfileEditModal';
import styles from './mypage.module.scss';

type Props = {
  profile: ProfileWithOrg;
  departments: OrgOption[];
  districts: OrgOption[];
};

export default function ProfileSection({ profile, departments, districts }: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const displayName = profile.display_name || profile.name;
  const avatarSrc = profile.avatar_url ? cloudinaryFetchUrl(profile.avatar_url) : null;

  // 부제는 부서 · 구역 (역할이 일반이 아니면 함께). 아무 소속도 없으면 이메일.
  const orgParts = [profile.departments?.name, profile.districts?.name].filter(Boolean);
  // 역할은 구역이 있을 때만 — 구역 없이 구역장/리더는 성립하지 않는다.
  if (profile.districts?.name && profile.district_role !== '일반') orgParts.push(profile.district_role);
  const subLine = orgParts.length > 0 ? orgParts.join(' · ') : profile.email;

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
        <span className={styles.email}>{subLine}</span>
      </div>
      <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
        프로필 편집
      </Button>
      <ProfileEditModal
        profile={profile}
        departments={departments}
        districts={districts}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </section>
  );
}
