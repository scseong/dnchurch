import type { Metadata } from 'next';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import { getWelcomePageData } from '@/services/about';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import AboutTabNav from '../_component/AboutTabNav';
import NewFamilyRegister from './_component/NewFamilyRegister';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '환영합니다',
  description: '대구동남교회에 처음 오시는 분을 위한 안내',
  openGraph: {
    ...OPEN_GRAPH_BASE,
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

export default async function WelcomePage() {
  const { faq } = await getWelcomePageData();

  return (
    <div className={styles.surface}>
      <h1 className={styles.sr_only}>환영합니다</h1>
      <AboutTabNav />
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
            {faq.map((item, index) => (
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

          <NewFamilyRegister />
        </div>
      </section>
    </div>
  );
}
