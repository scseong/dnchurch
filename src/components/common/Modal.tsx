'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';
import useScrollLock from '@/hooks/useScrollLock';
import styles from './Modal.module.scss';

type Props = PropsWithChildren<{
  onClose?: () => void;
  isVisible: boolean;
}>;

export default function Modal({ children, onClose, isVisible }: Props) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  useScrollLock(isVisible);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === overlayRef.current) {
      onClose?.();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className={clsx(styles.modal, isVisible && styles.show)}
      ref={overlayRef}
      onClick={handleOverlayClick}
    >
      {children}
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
}
