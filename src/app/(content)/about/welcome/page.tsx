import type { Metadata } from 'next';
import Link from 'next/link';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '환영합니다',
  description: '대구동남교회에 처음 오시는 분을 위한 안내',
  openGraph: {
    title: '환영합니다',
    description: '대구동남교회에 처음 오시는 분을 위한 안내'
  }
};

const WELCOME_STEPS = [
  {
    step: 'STEP 01',
    title: '예배에 참석하세요',
    desc: '주일 오전 11시, 부담 없이 오시면 됩니다. 안내자가 자리로 안내해 드립니다.'
  },
  {
    step: 'STEP 02',
    title: '새가족 카드 작성',
    desc: '예배 후, 원하실 때 1층 새가족실에서 간단한 인사를 나눕니다. 강요는 없습니다.'
  },
  {
    step: 'STEP 03',
    title: '새가족반 (4주)',
    desc: '교회와 신앙의 기초를 함께 나누는 작은 모임입니다. 차와 다과가 함께합니다.'
  },
  {
    step: 'STEP 04',
    title: '공동체로의 정착',
    desc: '관심 있는 소그룹·교구로 연결해 드립니다. 가까운 이웃을 만나는 시간입니다.'
  }
];

const WELCOME_FAQ = [
  {
    q: '처음 가도 괜찮을까요?',
    a: '물론입니다. 정해진 복장도, 미리 알려야 할 절차도 없습니다. 그저 오시는 발걸음 자체를 환영합니다. 입구의 「새가족 안내석」에서 안내자가 자리까지 함께 해드립니다.'
  },
  {
    q: '예배 시간에 늦어도 들어갈 수 있나요?',
    a: '네, 언제든 들어오실 수 있습니다. 문 앞 안내자가 조용히 자리로 안내해 드리며, 늦은 입장이 부담이 되지 않도록 배려하고 있습니다.'
  },
  {
    q: '아이와 함께 가도 되나요?',
    a: '주일 오전에는 5세 이상 자녀를 위한 교회학교가 운영되며, 영유아실(Cry Room)이 본당 옆에 마련되어 있어 함께 예배드릴 수 있습니다.'
  },
  {
    q: '꼭 등록해야 하나요?',
    a: '등록은 의무가 아닙니다. 천천히 둘러보시고, 마음이 편해지셨을 때 새가족반을 통해 인사 나누시면 됩니다. 등록 없이 예배만 참석하셔도 전혀 문제없습니다.'
  }
];

export default function WelcomePage() {
  return (
    <>
      <LayoutContainer className={styles.container}>
        {/* 환영 카드 */}
        <section className={styles.welcome_card}>
          <div className={styles.welcome_orb} aria-hidden="true" />
          <div className={styles.welcome_inner}>
            <p className={styles.eyebrow}>YOU ARE WELCOME HERE</p>
            <h2 className={styles.welcome_title}>
              어떤 모습으로 오셔도
              <br />
              괜찮습니다.
            </h2>
            <p className={styles.welcome_desc}>
              교회는 완성된 사람들이 모이는 곳이 아니라, 부족한 우리가 함께 자라는 자리입니다.
              <br className={styles.desc_break_pc} />
              이 자리에 처음 발걸음을 옮기신 당신을, 우리가 진심으로 기다려왔습니다.
            </p>
          </div>
        </section>

        {/* 4 STEPS */}
        <section className={styles.steps_section}>
          <p className={styles.section_label}>NEW FAMILY GUIDE</p>
          <ol className={styles.steps_list}>
            {WELCOME_STEPS.map((step, index) => (
              <li key={step.step} className={styles.step_card}>
                <span className={styles.step_number} aria-hidden="true">
                  0{index + 1}
                </span>
                <div className={styles.step_meta}>
                  <span className={styles.step_label}>{step.step}</span>
                  <h3 className={styles.step_title}>{step.title}</h3>
                  <p className={styles.step_desc}>{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </LayoutContainer>

      {/* FAQ + CTA (full-width 배경) */}
      <section className={styles.faq_section}>
        <div className={styles.faq_inner}>
          <header className={styles.faq_head}>
            <p className={styles.faq_eyebrow}>FAQ</p>
            <h3 className={styles.faq_title}>자주 묻는 질문</h3>
          </header>

          <ul className={styles.faq_list}>
            {WELCOME_FAQ.map((item, index) => (
              <li key={index} className={styles.faq_item}>
                <div className={styles.faq_row}>
                  <span className={styles.faq_q_mark}>Q.</span>
                  <span className={styles.faq_q_text}>{item.q}</span>
                </div>
                <div className={styles.faq_row}>
                  <span className={styles.faq_a_mark}>A.</span>
                  <p className={styles.faq_a_text}>{item.a}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className={styles.cta_card}>
            <div>
              <p className={styles.cta_eyebrow}>NEXT STEP</p>
              <p className={styles.cta_title}>먼저 인사 나누고 싶으신가요?</p>
            </div>
            {/* TODO: 실제 방문 등록 페이지 경로로 교체 */}
            <Link href="#" className={styles.cta_button}>
              방문 등록하기
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
