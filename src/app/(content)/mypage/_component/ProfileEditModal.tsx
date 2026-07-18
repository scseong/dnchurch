'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, TextField } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import { updateProfileAction } from '@/actions/profile.action';
import type { ProfileType } from '@/types/common';
import styles from './mypage.module.scss';

const DISPLAY_NAME_MAX_LENGTH = 10;
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;

type Props = {
  profile: ProfileType;
  open: boolean;
  onClose: () => void;
};

export default function ProfileEditModal({ profile, open, onClose }: Props) {
  const router = useRouter();
  const { success, error } = useToastStore();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile.display_name ?? profile.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState('');

  // 열림 전환 시 초기화 — effect 대신 렌더 중 prev 비교 (GalleryComposeSheet와 동일 패턴)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDisplayName(profile.display_name ?? profile.name);
      setAvatarFile(null);
      setFieldError('');
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      error('이미지 파일만 올릴 수 있습니다.');
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      error('이미지는 5MB 이하만 올릴 수 있습니다.');
      return;
    }
    setAvatarFile(file);
  };

  const handleSave = () => {
    const trimmed = displayName.trim();
    if (!trimmed || trimmed.length > DISPLAY_NAME_MAX_LENGTH) {
      setFieldError(`표시 이름은 1~${DISPLAY_NAME_MAX_LENGTH}자로 입력해주세요.`);
      return;
    }

    const formData = new FormData();
    formData.set('displayName', trimmed);
    if (avatarFile) {
      formData.set('avatar', avatarFile);
    }

    startTransition(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        success(result.message);
        onClose();
        router.refresh();
      } else {
        error(result.message);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="프로필 편집"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? '저장 중…' : '저장'}
          </Button>
        </>
      }
    >
      <div className={styles.edit_avatar}>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
              fileInputRef.current.click();
            }
          }}
        >
          사진 변경
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleFileChange}
        />
        {avatarFile && <span className={styles.file_name}>{avatarFile.name}</span>}
      </div>
      <TextField
        label="표시 이름"
        value={displayName}
        onChange={(event) => {
          setDisplayName(event.target.value);
          setFieldError('');
        }}
        maxLength={DISPLAY_NAME_MAX_LENGTH}
        error={fieldError || undefined}
        helper={`커뮤니티에서 보이는 이름이에요 (${DISPLAY_NAME_MAX_LENGTH}자 이내)`}
      />
    </Modal>
  );
}
