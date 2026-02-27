import { LayoutContainer } from '@/components/layout';
import EmailVerificationRequestForm from '@/app/_component/auth/EmailVerificationRequestForm';
import styles from '../login/page.module.scss';

export default function ForgetPasswordPage() {
  return (
    <section>
      <LayoutContainer>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <h1>비밀번호를 잊으셨나요?</h1>
            <p>이메일로 비밀번호를 재설정 할 수 있는 인증 링크를 보내드립니다.</p>
          </div>
          <EmailVerificationRequestForm />
        </div>
      </LayoutContainer>
    </section>
  );
}
