import type { ReactNode } from 'react';
import styles from './AboutWorship.module.scss';

const BibleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <path d="M2 7s2-1 5-1 5 1 5 1 2-1 5-1 5 1 5 1v13s-2-1-5-1-5 1-5 1-2-1-5-1-5 1-5 1V7z" />
    <line x1="12" y1="6" x2="12" y2="20" />
  </svg>
);

const CrossIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <line x1="12" y1="3" x2="12" y2="21" />
    <line x1="6" y1="9" x2="18" y2="9" />
  </svg>
);

const HandsIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
    <path d="M8 11l-4 4 3 3 5-3M16 13l4-4-3-3-5 3" />
    <path d="M11 8l5 5M9 13l4-4" />
  </svg>
);

type Item = {
  num: string;
  why: string;
  title: string;
  body: string;
  icon: ReactNode;
};

const ITEMS: Item[] = [
  {
    num: '01',
    why: 'WHY',
    title: '예배의 본질',
    body: '예배는 형식이나 의식이 아니라, 살아계신 하나님과의 인격적인 만남입니다. 우리는 영과 진리로 하나님 앞에 나아가, 그분의 영광을 높이고 그분이 베푸신 은혜를 기억합니다.',
    icon: <BibleIcon />
  },
  {
    num: '02',
    why: 'HOW',
    title: '예배의 방식',
    body: '말씀의 선포와 성례의 집행을 중심으로, 개혁주의 전통을 따라 예배를 드립니다. 찬양과 기도, 신앙고백과 봉헌을 통해 온 회중이 함께 하나님을 예배합니다.',
    icon: <CrossIcon />
  },
  {
    num: '03',
    why: 'WHO',
    title: '예배의 자리',
    body: '신자와 구도자, 처음 오신 분 모두 함께 드립니다. 정해진 복장이나 자격은 없습니다. 그저 마음을 열고 오시면, 따뜻한 환영이 기다리고 있습니다.',
    icon: <HandsIcon />
  }
];

export default function AboutWorship() {
  return (
    <section className={styles.band}>
      <header className={styles.intro}>
        <p className={styles.eyebrow}>About Worship</p>
        <h3>우리가 드리는 예배</h3>
        <p className={styles.lead}>
          대구동남교회는 개혁주의 전통 위에서<br />
          영과 진리로 하나님을 예배합니다.
        </p>
      </header>
      <blockquote className={styles.scripture}>
        <p className={styles.ref}>요한복음 4 : 24</p>
        <p className={styles.verse}>
          “하나님은 영이시니<br />
          예배하는 자가 영과 진리로<br />
          예배할지니라.”
        </p>
      </blockquote>
      <ol className={styles.list}>
        {ITEMS.map((item) => (
          <li key={item.num} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <div className={styles.body_col}>
              <div className={styles.head}>
                <span className={styles.num}>{item.num}</span>
                <h4>{item.title}</h4>
                <span className={styles.why}>· {item.why}</span>
              </div>
              <p className={styles.body}>{item.body}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
