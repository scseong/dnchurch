import LayoutContainer from '../layout/common/LayoutContainer';
import styles from './Banner.module.scss';

export default async function Banner() {
  return (
    <section className={styles.section}>
      <div className={styles.banner}>
        <LayoutContainer>
          <h2>
            동남교회에 오신 것을
            <br />
            환영합니다
          </h2>
        </LayoutContainer>
      </div>
    </section>
  );
}
