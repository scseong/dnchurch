'use client';

import Link from 'next/link';
import { IoCheckmarkSharp } from 'react-icons/io5';
import { Button } from '@/components/ui';
import authStyles from '@/app/_component/auth/authForm.module.scss';
import styles from './signUpWizard.module.scss';

type CompleteStepProps = {
  name: string;
  email: string;
  redirect: string;
};

export default function CompleteStep({ name, email, redirect }: CompleteStepProps) {
  return (
    <div className={styles.complete}>
      <div className={styles.check_badge}>
        <span className={styles.check_ring} aria-hidden="true" />
        <span className={styles.check_circle} aria-hidden="true">
          <IoCheckmarkSharp />
        </span>
      </div>

      <p className={styles.complete_title}>가입이 완료되었어요</p>
      <p className={styles.complete_welcome}>
        대구동남교회 가족이 되신 것을
        <br />
        진심으로 환영합니다
      </p>

      <div className={styles.summary}>
        <div className={styles.summary_row}>
          <span className={styles.summary_key}>이름</span>
          <span className={styles.summary_value}>{name}</span>
        </div>
        <div className={styles.summary_divider} />
        <div className={styles.summary_row}>
          <span className={styles.summary_key}>이메일</span>
          <span className={styles.summary_value}>{email}</span>
        </div>
      </div>

      <p className={styles.complete_note}>
        로그인하면 교제·기도·헌금·출석 서비스를 이용할 수 있어요
      </p>

      <div className={styles.complete_actions}>
        <Button
          variant="accent"
          fullWidth
          size="md"
          className={authStyles.cta}
          onClick={() => window.location.assign(redirect)}
        >
          대구동남교회 시작하기
        </Button>
        <Link href="/login" className={styles.login_link}>
          로그인 화면으로
        </Link>
      </div>
    </div>
  );
}
