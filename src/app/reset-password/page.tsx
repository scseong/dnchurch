import { LayoutContainer } from '@/components/layout';
import PasswordUpdateForm from '@/app/_component/auth/PasswordUpdateForm';
import styles from '../login/page.module.scss';

export default function page() {
  return (
    <section>
      <LayoutContainer>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <h1>비밀번호 재설정하기</h1>
            <p>새로운 비밀번호를 입력하세요.</p>
          </div>
          <PasswordUpdateForm />
        </div>
      </LayoutContainer>
    </section>
  );
}
