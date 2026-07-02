'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren
} from 'react';
import NoticeDrawer from './NoticeDrawer';
import type { NoticeDrawerItem } from '@/types/notice';

type NoticeDrawerContextValue = {
  openNotice: (noticeId: NoticeDrawerItem['id']) => void;
};

const NoticeDrawerContext = createContext<NoticeDrawerContextValue | null>(null);

export function useNoticeDrawer() {
  const context = useContext(NoticeDrawerContext);
  if (!context) throw new Error('useNoticeDrawer는 NoticeDrawerProvider 안에서만 사용할 수 있습니다.');
  return context;
}

type Props = PropsWithChildren<{
  notices: NoticeDrawerItem[];
}>;

// drawer 상태만 클라이언트에 남기는 경계 — 목록 마크업(children)은 서버 렌더 결과를 그대로 받는다.
export default function NoticeDrawerProvider({ notices, children }: Props) {
  const [drawerNotice, setDrawerNotice] = useState<NoticeDrawerItem | null>(null);

  const openNotice = useCallback(
    (noticeId: NoticeDrawerItem['id']) => {
      setDrawerNotice(notices.find((notice) => notice.id === noticeId) ?? null);
    },
    [notices]
  );

  const handleCloseDrawer = useCallback(() => {
    setDrawerNotice(null);
  }, []);

  const handleNavigate = useCallback(
    (direction: 'prev' | 'next') => {
      if (!drawerNotice) return;
      const currentIndex = notices.findIndex((notice) => notice.id === drawerNotice.id);
      // drawer가 열린 채 URL 파라미터로 목록이 바뀌면 현재 공지가 목록에 없을 수 있다 (PR #116 리뷰 반영)
      if (currentIndex === -1) return;
      const nextIndex = direction === 'prev' ? currentIndex - 1 : currentIndex + 1;
      if (nextIndex >= 0 && nextIndex < notices.length) {
        setDrawerNotice(notices[nextIndex]);
      }
    },
    [notices, drawerNotice]
  );

  const currentIndex = drawerNotice
    ? notices.findIndex((notice) => notice.id === drawerNotice.id)
    : -1;

  // drawer 상태가 바뀔 때마다 새 객체가 만들어져 소비자(행 트리거) 전부가 리렌더되는 것을 막는다
  const contextValue = useMemo(() => ({ openNotice }), [openNotice]);

  return (
    <NoticeDrawerContext.Provider value={contextValue}>
      {children}
      <NoticeDrawer
        notice={drawerNotice}
        onClose={handleCloseDrawer}
        onNavigate={handleNavigate}
        hasPrev={currentIndex > 0}
        hasNext={currentIndex !== -1 && currentIndex < notices.length - 1}
      />
    </NoticeDrawerContext.Provider>
  );
}
