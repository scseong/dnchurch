import styles from './Greeting.module.scss';

export default function Greeting() {
  return (
    <section className={styles.greeting}>
      <h3>
        하나님은 당신을 <span>사랑</span>하십니다.
      </h3>
      <p>
        수고하고 무거운 짐진 자들아 <br />다 내게로 오라 내가 너희를 쉬게 하리라
        <br />
        <span>마태복음 11:28</span>
      </p>
    </section>
  );
}
