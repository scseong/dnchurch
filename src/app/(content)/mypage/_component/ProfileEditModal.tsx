'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Modal, Select, TextField } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import { updateProfileAction } from '@/actions/profile.action';
import type { ProfileType, OrgOption } from '@/types/common';
import styles from './mypage.module.scss';

const DISPLAY_NAME_MAX_LENGTH = 10;
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const ROLE_OPTIONS = [
  { value: '일반', label: '일반' },
  { value: '구역리더', label: '구역리더' },
  { value: '구역장', label: '구역장' }
];

type Props = {
  profile: ProfileType;
  departments: OrgOption[];
  districts: OrgOption[];
  open: boolean;
  onClose: () => void;
};

function toOptions(items: OrgOption[]) {
  return [{ value: '', label: '선택 안 함' }, ...items.map((item) => ({ value: String(item.id), label: item.name }))];
}

export default function ProfileEditModal({ profile, departments, districts, open, onClose }: Props) {
  const router = useRouter();
  const { success, error } = useToastStore();
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [displayName, setDisplayName] = useState(profile.display_name ?? profile.name);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [fieldError, setFieldError] = useState('');
  const [deptId, setDeptId] = useState(profile.dept_id ? String(profile.dept_id) : '');
  const [districtId, setDistrictId] = useState(profile.district_id ? String(profile.district_id) : '');
  const [districtRole, setDistrictRole] = useState(profile.district_role ?? '일반');

  // 열림 전환 시 초기화 — effect 대신 렌더 중 prev 비교 (GalleryComposeSheet와 동일 패턴)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setDisplayName(profile.display_name ?? profile.name);
      setAvatarFile(null);
      setFieldError('');
      setDeptId(profile.dept_id ? String(profile.dept_id) : '');
      setDistrictId(profile.district_id ? String(profile.district_id) : '');
      setDistrictRole(profile.district_role ?? '일반');
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
    formData.set('deptId', deptId);
    formData.set('districtId', districtId);
    formData.set('districtRole', districtRole);
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
      <div className={styles.edit_field}>
        <span className={styles.edit_label}>부서</span>
        <Select value={deptId} onChange={setDeptId} options={toOptions(departments)} aria-label="부서" />
      </div>
      <div className={styles.edit_field}>
        <span className={styles.edit_label}>구역</span>
        <Select
          value={districtId}
          onChange={(value) => {
            setDistrictId(value);
            // 구역을 비우면 역할은 '일반'만 유효 — 서버 강등(profile.action)과 맞춰 state/화면 괴리를 없앤다
            if (!value) setDistrictRole('일반');
          }}
          options={toOptions(districts)}
          aria-label="구역"
        />
      </div>
      <div className={styles.edit_field}>
        <span className={styles.edit_label}>구역 역할</span>
        <Select
          value={districtId ? districtRole : '일반'}
          onChange={setDistrictRole}
          options={ROLE_OPTIONS}
          disabled={!districtId}
          aria-label="구역 역할"
        />
      </div>
    </Modal>
  );
}
