'use client';

import { IoMailOutline } from 'react-icons/io5';
import { Button } from '@/components/ui';
import authStyles from '@/app/_component/auth/authForm.module.scss';
import styles from './signUpWizard.module.scss';

type CompleteStepProps = {
  email: string;
};

export default function CompleteStep({ email }: CompleteStepProps) {
  return (
    <div className={styles.complete}>
      <div className={styles.check_badge}>
        <span className={styles.check_ring} aria-hidden="true" />
        <span className={styles.check_circle} aria-hidden="true">
          <IoMailOutline />
        </span>
      </div>

      <p className={styles.complete_title}>이메일을 확인해 주세요</p>
      <p className={styles.complete_welcome}>
        <strong>{email}</strong> 주소로
        <br />
        인증 링크를 보냈어요
      </p>

      <p className={styles.complete_note}>
        메일의 링크를 눌러 가입을 완료해 주세요.
        <br />
        메일이 오지 않으면 스팸함을 확인해 주세요.
      </p>

      <div className={styles.complete_actions}>
        <Button
          variant="accent"
          fullWidth
          size="md"
          className={authStyles.cta}
          onClick={() => window.location.assign('/login')}
        >
          로그인하러 가기
        </Button>
      </div>
    </div>
  );
}
