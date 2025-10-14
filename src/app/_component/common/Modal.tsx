'use client';

import { PropsWithChildren, useRef } from 'react';
import { createPortal } from 'react-dom';
import style from './Modal.module.scss';

export default function Modal({ children }: PropsWithChildren) {
  const overlayRef = useRef<HTMLDialogElement>(null);

  return createPortal(
    <dialog className={style.modal} ref={overlayRef}>
      {children}
    </dialog>,
    document.getElementById('modal-root') as HTMLElement
  );
}
