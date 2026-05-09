import type { Metadata } from 'next';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import { getPastorPageData } from '@/services/about';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '인사말',
  description: '대구동남교회 담임목사 인사말',
  openGraph: {
    title: '인사말',
    description: '대구동남교회 담임목사 인사말'
  }
};

// 정적 라벨·구절은 hardcoded 유지 (ADR 0006)
const PASTOR_STATIC = {
  enTitle: 'SENIOR PASTOR',
  verse: '여호와는 나의 목자시니 내게 부족함이 없으리로다',
  verseRef: '시편 23 : 1'
};

export default async function PastorPage() {
  const { pastor } = await getPastorPageData();

  const name = pastor?.name ?? 'OOO';
  const title = pastor?.title ?? '담임목사';
  const careerSource = pastor ? [...pastor.education, ...pastor.experience] : [];
  const career = careerSource.length > 0 ? careerSource : ['준비 중'];
  const greetingParagraphs = pastor?.greetingParagraphs ?? [];

  return (
    <LayoutContainer className={styles.container}>
      <div className={styles.grid}>
        <aside className={styles.profile_block}>
          <div className={styles.photo} aria-hidden="true">
            PASTOR PHOTO
          </div>
          <p className={styles.eyebrow}>{PASTOR_STATIC.enTitle}</p>
          <p className={styles.name_line}>
            <span className={styles.name}>{name}</span>
            <span className={styles.role}>{title}</span>
          </p>
        </aside>

        <article className={styles.content}>
          <div className={styles.verse_card}>
            <p className={styles.verse_ref}>{PASTOR_STATIC.verseRef}</p>
            <p className={styles.verse_text}>“{PASTOR_STATIC.verse}”</p>
          </div>

          <p className={styles.section_label}>WELCOME MESSAGE</p>
          <h2 className={styles.lead}>
            “복음 위에 서서,
            <br />
            이웃의 자리에서 함께 걷겠습니다.”
          </h2>

          {greetingParagraphs.map((paragraph, index) => (
            <p key={index} className={styles.paragraph}>
              {paragraph}
            </p>
          ))}

          <footer className={styles.signature}>
            <p className={styles.sig_role}>대구동남교회 담임목사</p>
            <p className={styles.sig_name}>
              <span>{name}</span>
              <span className={styles.sig_drim}>드림</span>
            </p>
          </footer>
        </article>

        <aside className={styles.career_block}>
          <p className={styles.career_label}>CAREER</p>
          <ul className={styles.career_list}>
            {career.map((line, index) => (
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
