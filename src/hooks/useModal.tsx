import { useEffect, useRef, useState } from 'react';

export default function useModal() {
  const [isVisible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setVisible((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent | PointerEvent) => {
    const modalRoot = document.getElementById('modal-root');
    if (modalRoot?.contains(event.target as Node)) {
      return;
    }

    if (ref.current && !ref.current.contains(event.target as Node)) {
      setVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return {
    isVisible,
    ref,
    handleToggle,
    setVisible
  };
}
