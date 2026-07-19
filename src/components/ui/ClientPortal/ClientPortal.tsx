'use client';

import { PropsWithChildren, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * children을 `modal-root`(없으면 `document.body`)로 포털한다.
 *
 * 서버와 첫 클라이언트 렌더를 모두 null로 맞춰 hydration mismatch를 막는다 —
 * `mounted`는 서버·hydration에서 `false`라 둘 다 null을 내고, portal은 `useEffect`가
 * 도는 두 번째 패스에서만 생성된다(hydration 이후라 검사 대상 아님).
 *
 * 전제: 닫힌 상태로 시작하는(closed-start) 다이얼로그용. 처음부터 열린 채(open=true)
 * mount되면 첫 패스가 null이라 useDialog focus effect가 panel 부재로 focus를 건너뛴다.
 * 그런 호출부가 생기면 focus를 portal mount 이후로 보정해야 한다.
 */
export function ClientPortal({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 서버·hydration 첫 렌더를 null로 맞춘 뒤 mount 후 1회만 portal을 켠다.
    // 이 client-only 게이트는 set-state-in-effect가 본질이라 의도적 (queueMicrotask 금지 규칙 준수).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only mount 게이트: hydration 후 1회만 portal 활성 (위 주석 참조)
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(children, document.getElementById('modal-root') ?? document.body);
}
