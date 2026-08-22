'use client';

import { useTransition } from 'react';
import { useToastStore } from '@/store/toast.store';
import { signOutAction } from '@/actions/auth.action';

// 로그아웃 처리를 한 곳에 모은다 — AccountMenu와 설정 시트가 같은 경로를 쓰도록.
// 성공 시 전체 리로드로 SessionContextProvider 등 클라이언트 인증 상태까지 초기화한다.
export function useSignOut() {
  const error = useToastStore((state) => state.error);
  const [isSigningOut, startSignOut] = useTransition();

  const signOut = () => {
    startSignOut(async () => {
      const result = await signOutAction();
      if (result.success) {
        window.location.replace('/');
      } else {
        error(result.message);
      }
    });
  };

  return { signOut, isSigningOut };
}
