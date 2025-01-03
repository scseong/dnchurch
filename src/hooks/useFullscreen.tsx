import { useRef } from 'react';

export const useFullscreen = (callback) => {
  const element = useRef<HTMLDivElement>();

  const triggerFull = () => {
    if (element.current) {
      element.current.requestFullscreen();
      if (callback && typeof callback === 'function') {
        callback(true);
      }
    }
  };
  const exitFull = () => {
    document.exitFullscreen();
    if (callback && typeof callback === 'function') {
      callback(false);
    }
  };
  return { element, triggerFull, exitFull };
};
