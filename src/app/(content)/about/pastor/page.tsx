import type { Metadata } from 'next';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '인사말',
  description: '대구동남교회 담임목사 인사말',
  openGraph: {
    title: '인사말',
    description: '대구동남교회 담임목사 인사말'
  }
};

// TODO: 실제 담임목사 정보로 교체
const PASTOR = {
  name: 'OOO',
  title: '담임목사',
  enTitle: 'SENIOR PASTOR',
  career: [
    'TODO: 신학교 학력 입력',
    'TODO: 신학대학원 학력 입력',
    'TODO: 박사 학위 등 입력',
    '現 대구동남교회 담임목사'
  ],
  verse: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
  verseRef: '시편 23 : 1'
};

const GREETING_PARAS = [
  '대구동남교회 홈페이지를 찾아주신 여러분을 진심으로 환영합니다.',
  '우리 교회는 1952년에 설립된 이후, 한결같이 「말씀과 기도, 그리고 사랑의 공동체」라는 세 기둥 위에 서 있습니다. 시대는 빠르게 변하지만, 복음은 변하지 않습니다. 우리는 그 변하지 않는 진리 안에서, 변화하는 이 시대의 이웃과 가족이 되고자 합니다.',
  '이 작은 페이지가 여러분과 우리 교회 사이의 첫 만남이 되기를 바랍니다. 직접 발걸음 하시는 날, 따뜻한 차 한 잔과 함께 더 깊은 이야기를 나눌 수 있기를 기대합니다.'
];

export default function PastorPage() {
  return (
    <LayoutContainer className={styles.container}>
      <div className={styles.grid}>
        <aside className={styles.profile_block}>
          <div className={styles.photo} aria-hidden="true">
            PASTOR PHOTO
          </div>
          <p className={styles.eyebrow}>{PASTOR.enTitle}</p>
          <p className={styles.name_line}>
            <span className={styles.name}>{PASTOR.name}</span>
            <span className={styles.role}>{PASTOR.title}</span>
          </p>
        </aside>

        <article className={styles.content}>
          <div className={styles.verse_card}>
            <p className={styles.verse_ref}>{PASTOR.verseRef}</p>
            <p className={styles.verse_text}>“{PASTOR.verse}”</p>
          </div>

          <p className={styles.section_label}>WELCOME MESSAGE</p>
          <h2 className={styles.lead}>
            “복음 위에 서서,
            <br />
            이웃의 자리에서 함께 걷겠습니다.”
          </h2>

          {GREETING_PARAS.map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}

          <footer className={styles.signature}>
            <p className={styles.sig_role}>대구동남교회 담임목사</p>
            <p className={styles.sig_name}>
              <span>{PASTOR.name}</span>
              <span className={styles.sig_drim}>드림</span>
            </p>
          </footer>
        </article>

        <aside className={styles.career_block}>
          <p className={styles.career_label}>CAREER</p>
          <ul className={styles.career_list}>
            {PASTOR.career.map((line, index) => (
              <li key={index} className={styles.career_item}>
                <span className={styles.career_dot} aria-hidden="true" />
                {line}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </LayoutContainer>
  );
}
