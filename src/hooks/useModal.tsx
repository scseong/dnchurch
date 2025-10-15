import { useRef, useState } from 'react';

export default function useModal() {
  const [isVisible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setVisible((prev) => !prev);
  };

  return {
    isVisible,
    ref,
    handleToggle,
    setVisible
  };
}
