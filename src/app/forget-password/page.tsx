'use client';

import { useState } from 'react';
import { LayoutContainer } from '@/app/_component/layout/common';
import { requestPasswordResetEmail } from '@/apis/auth';
import styles from './page.module.scss';

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState('');

  const handleSendEmailClick = () => {
    if (email.trim() === '') return;

    requestPasswordResetEmail(email);
  };

  return (
    <section>
      <LayoutContainer>
        <div>
          <h1>비밀번호를 잊으셨나요?</h1>
          <p className="text-muted-foreground">
            이메일로 비밀번호를 재설정 할 수 있는 인증 링크를 보내드립니다.
          </p>
        </div>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해주세요."
          />
          <button onClick={handleSendEmailClick}>인증 메일 요청하기</button>
        </div>
      </LayoutContainer>
    </section>
  );
}
