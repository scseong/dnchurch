import { useLayoutEffect, useState } from 'react';
import { debounce } from 'lodash-es';

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  const MOBILE_MAX_WIDTH = 601;

  useLayoutEffect(() => {
    const updateSize = () => {
      setIsMobile(window.innerWidth < MOBILE_MAX_WIDTH);
    };

    updateSize();

    const debouncedUpdateSize = debounce(updateSize, 250);
    window.addEventListener('resize', debouncedUpdateSize);

    return () => {
      window.removeEventListener('resize', debouncedUpdateSize);
    };
  }, []);

  return isMobile;
}
