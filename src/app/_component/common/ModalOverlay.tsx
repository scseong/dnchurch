import { useEffect } from 'react';

type ModalOverlayProps = {
  isVisible: boolean;
  handleClickOutside: (event: MouseEvent | PointerEvent) => void;
};

export default function ModalOverlay({ isVisible, handleClickOutside }: ModalOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
    } else {
      document.removeEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [handleClickOutside, isVisible]);

  return isVisible ? <div className="overlay" /> : null;
}
