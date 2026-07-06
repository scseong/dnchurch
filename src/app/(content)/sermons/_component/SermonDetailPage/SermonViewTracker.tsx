'use client';

import { useEffect, useRef } from 'react';
import { incrementSermonViewsAction } from '@/actions/sermon-views.action';

type SermonViewTrackerProps = {
  sermonId: number;
};

/** 마운트 시 조회수 +1. ISR 페이지 렌더 밖에서 방문마다 실행되도록 분리한 tracker. */
export default function SermonViewTracker({ sermonId }: SermonViewTrackerProps) {
  // dev StrictMode의 Effect 2회 실행은 막되, 상세 간 이동으로 sermonId가 바뀌면 다시 보낸다.
  const trackedSermonId = useRef<number | null>(null);

  useEffect(() => {
    if (trackedSermonId.current === sermonId) return;
    trackedSermonId.current = sermonId;
    incrementSermonViewsAction(sermonId);
  }, [sermonId]);

  return null;
}
