import { useEffect } from 'react';

type ModalOverlayProps = {
  isVisible: boolean;
  isDark?: boolean;
};

export default function ModalOverlay({ isVisible, isDark = true }: ModalOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  if (!isVisible) {
    return null;
  }

  return <div className={`${isDark ? 'overlay' : 'overlay-light'}`} />;
}
