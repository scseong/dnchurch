'use client';

import type { PropsWithChildren } from 'react';
import { useNoticeDrawer } from './NoticeDrawerProvider';
import type { NoticeDrawerItem } from '@/types/notice';

type TriggerProps = PropsWithChildren<{
  noticeId: NoticeDrawerItem['id'];
  className?: string;
}>;

// 행 클릭만 담당하는 클라이언트 리프 — 셀 내용(children)은 서버 렌더 결과를 받는다.
export function NoticeTableRowTrigger({
  noticeId,
  label,
  className,
  children
}: TriggerProps & { label: string }) {
  const { openNotice } = useNoticeDrawer();

  return (
    <tr
      className={className}
      onClick={() => openNotice(noticeId)}
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && openNotice(noticeId)}
      role="button"
      aria-label={label}
    >
      {children}
    </tr>
  );
}

export function NoticeMobileRowTrigger({ noticeId, className, children }: TriggerProps) {
  const { openNotice } = useNoticeDrawer();

  return (
    <button type="button" className={className} onClick={() => openNotice(noticeId)}>
      {children}
    </button>
  );
}
