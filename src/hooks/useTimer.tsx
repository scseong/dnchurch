import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';

export default function useTimer(onEnd?: () => void) {
  const [remain, setRemain] = useState(0);
  const [finished, setFinished] = useState(false);
  const expireAtRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const tick = useCallback(() => {
    if (!expireAtRef.current) return;

    const diff = dayjs(expireAtRef.current).diff(dayjs(), 'second');

    if (diff <= 0) {
      stop();
      setRemain(0);
      setFinished(true);
      onEnd?.();
      return;
    }

    setRemain(diff);
  }, [onEnd]);

  const start = useCallback(
    (durationSec: number) => {
      expireAtRef.current = dayjs().add(durationSec, 'second').toISOString();
      setFinished(false);
      tick();
      intervalRef.current = setInterval(tick, 1000);
    },
    [tick]
  );

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') tick();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [tick]);

  const formattedRemain = useMemo(() => {
    const m = Math.floor(remain / 60);
    const s = String(remain % 60).padStart(2, '0');
    return `${String(m).padStart(2, '0')}:${s}`;
  }, [remain]);

  return { remain, start, formattedRemain, isRunning: remain > 0, isFinished: finished };
}
