import LayoutContainer from '@/app/_component/layout/common/LayoutContainer';
import styles from './Greeting.module.scss';

export default function Greeting() {
  return (
    <section className={styles.greeting}>
      <LayoutContainer className={styles.container}>
        <p>&quot;수고하고 무거운 짐진 자들아 다 내게로 오라 내가 너희를 쉬게 하리라&quot;</p>
        <span>마태복음 11:28</span>
      </LayoutContainer>
    </section>
  );
}
