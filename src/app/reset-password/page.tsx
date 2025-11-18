'use client';

import { useState } from 'react';
import { LayoutContainer } from '@/app/_component/layout/common';
import { updatePassword } from '@/apis/auth';

export default function page() {
  const [password, setPassword] = useState('');

  const handleUpdatePasswordClick = () => {
    if (password.trim() === '') return;
    updatePassword(password);
  };

  return (
    <section>
      <LayoutContainer>
        <div>
          <h1>비밀번호 재설정하기</h1>
          <p>새로운 비밀번호를 입력하세요.</p>
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="새로운 비밀번호를 입력해주세요."
          />
          <button onClick={handleUpdatePasswordClick}>비밀번호 변경하기</button>
        </div>
      </LayoutContainer>
    </section>
  );
}
