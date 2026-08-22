'use client';

import { useState, useTransition } from 'react';
import { Button, Modal, TextField } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import { changePasswordAction } from '@/actions/auth.action';
import { PASSWORD_REGEX } from '@/constants/regex';
import styles from './mypage.module.scss';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function PasswordChangeModal({ open, onClose }: Props) {
  const success = useToastStore((state) => state.success);
  const error = useToastStore((state) => state.error);
  const [isPending, startTransition] = useTransition();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  // 열림 전환 시 초기화 — effect 대신 렌더 중 prev 비교 (GalleryComposeSheet와 동일 패턴)
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setNewPasswordError('');
      setConfirmError('');
    }
  }

  const handleSubmit = () => {
    if (!PASSWORD_REGEX.test(newPassword)) {
      setNewPasswordError('비밀번호는 영문, 숫자 포함 8자 이상이여야 합니다.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError('새 비밀번호가 서로 일치하지 않습니다.');
      return;
    }

    startTransition(async () => {
      const result = await changePasswordAction(currentPassword, newPassword);
      if (result.success) {
        success(result.message);
        onClose();
      } else {
        error(result.message);
      }
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="비밀번호 변경"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            취소
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? '변경 중…' : '변경'}
          </Button>
        </>
      }
    >
      <div className={styles.password_fields}>
        <TextField
          label="현재 비밀번호"
          type="password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />
        <TextField
          label="새 비밀번호"
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(event) => {
            setNewPassword(event.target.value);
            setNewPasswordError('');
          }}
          error={newPasswordError || undefined}
          helper="영문, 숫자 포함 8자 이상"
        />
        <TextField
          label="새 비밀번호 확인"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setConfirmError('');
          }}
          error={confirmError || undefined}
        />
      </div>
    </Modal>
  );
}
