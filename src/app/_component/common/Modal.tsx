'use client';

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import style from './Modal.module.scss';

export default function Modal({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <dialog className={style.modal} ref={overlayRef}>
      {children}
    </dialog>,
    document.getElementById('modal-root') as HTMLElement
  );
}
