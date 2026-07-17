'use client';

import { IoCheckmarkSharp } from 'react-icons/io5';
import { Button } from '@/components/ui';
import authStyles from '@/app/_component/auth/authForm.module.scss';
import styles from './signUpWizard.module.scss';

type ConfirmedWelcomeProps = {
  /** 인증한 사용자의 표시 이름. 없으면 이름 없이 환영 문구만 보여준다. */
  name: string;
  /** 시작하기 버튼이 이동할 사이트 내 경로. */
  next: string;
};

// 이메일 인증 링크 클릭 → /auth/confirm 검증 성공 후 착지하는 완료 화면.
// 스텝 3(발송 안내)과 배지·애니메이션을 공유하려고 signUpWizard 모듈을 함께 쓴다.
export default function ConfirmedWelcome({ name, next }: ConfirmedWelcomeProps) {
  return (
    <div className={styles.complete}>
      <div className={styles.check_badge}>
        <span className={styles.check_ring} aria-hidden="true" />
        <span className={styles.check_circle} aria-hidden="true">
          <IoCheckmarkSharp />
        </span>
      </div>

      <p className={styles.complete_title}>가입이 완료됐어요</p>
      <p className={styles.complete_welcome}>
        {name ? (
          <>
            <strong>{name}</strong>님, 환영합니다
          </>
        ) : (
          '환영합니다'
        )}
      </p>

      <div className={styles.complete_actions}>
        <Button
          variant="accent"
          fullWidth
          size="md"
          className={authStyles.cta}
          onClick={() => window.location.assign(next)}
        >
          시작하기
        </Button>
      </div>
    </div>
  );
}
