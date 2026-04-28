'use client';

import { useRef } from 'react';
import clsx from 'clsx';
import Modal from '@/components/common/Modal';
import styles from './index.module.scss';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
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
  onConfirm
}: ConfirmModalProps) {
  // 닫히는 transition 동안 마지막 컨텐츠 유지 — prop이 즉시 비워져도 시각적 깜빡임 없음
  const snapshotRef = useRef<ContentSnapshot>({
    title,
    description,
    confirmLabel,
    cancelLabel,
    danger
  });
  if (open) {
    snapshotRef.current = { title, description, confirmLabel, cancelLabel, danger };
  }
  const content = open
    ? { title, description, confirmLabel, cancelLabel, danger }
    : snapshotRef.current;

  return (
    <Modal isVisible={open} onClose={onClose}>
      <div
        className={styles.panel}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby={content.description ? 'confirm-modal-description' : undefined}
      >
        <header className={styles.header}>
          <h2 id="confirm-modal-title" className={styles.title}>
            {content.title}
          </h2>
        </header>
        {content.description && (
          <div className={styles.body}>
            <p id="confirm-modal-description" className={styles.description}>
              {content.description}
            </p>
          </div>
        )}
        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose}>
            {content.cancelLabel}
          </button>
          <button
            type="button"
            className={clsx(styles.confirm, content.danger && styles.danger)}
            onClick={onConfirm}
          >
            {content.confirmLabel}
          </button>
        </footer>
      </div>
    </Modal>
  );
}
