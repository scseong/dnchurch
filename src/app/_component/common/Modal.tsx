'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useScrollLock from '@/hooks/useScrollLock';
import style from './Modal.module.scss';

type Props = PropsWithChildren<{
  onClose?: () => void;
}>;

export default function Modal({ children, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  useScrollLock();

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose?.();
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className={style.modal} ref={overlayRef} onClick={handleOverlayClick}>
      {children}
    </div>,
    document.getElementById('modal-root') as HTMLElement
  );
}
