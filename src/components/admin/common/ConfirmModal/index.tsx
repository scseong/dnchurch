'use client';

import { useState, useLayoutEffect } from 'react';
import { Modal, Button } from '@/components/ui';
import styles from './index.module.scss';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  isLoading?: boolean;
  loadingLabel?: string;
  onConfirm: () => void;
}

interface ContentSnapshot {
  title: string;
  description?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger: boolean;
}

export default function ConfirmModal({
  open,
  onClose,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  danger = false,
  isLoading = false,
  loadingLabel = '처리 중...',
  onConfirm
}: ConfirmModalProps) {
  // 닫히는 transition 동안 마지막 컨텐츠 유지 — prop이 즉시 비워져도 시각적 깜빡임 없음.
  // useState + useLayoutEffect 패턴 — render 중 ref mutate를 피해 React 19 Concurrent Mode 안전.
  const liveContent: ContentSnapshot = { title, description, confirmLabel, cancelLabel, danger };
  const [snapshot, setSnapshot] = useState<ContentSnapshot>(liveContent);

  useLayoutEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 외부 prop 동기화 (transition snapshot 갱신)
      setSnapshot({ title, description, confirmLabel, cancelLabel, danger });
    }
  }, [open, title, description, confirmLabel, cancelLabel, danger]);

  const content = open ? liveContent : snapshot;

  // 로딩 중에는 ESC/overlay click으로 닫히지 않도록 onClose 차단
  const handleClose = isLoading ? () => {} : onClose;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={content.title}
      role="alertdialog"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {content.cancelLabel}
          </Button>
          <Button
            variant={content.danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? loadingLabel : content.confirmLabel}
          </Button>
        </>
      }
    >
      {content.description && (
        <p className={styles.description}>{content.description}</p>
      )}
    </Modal>
  );
}
