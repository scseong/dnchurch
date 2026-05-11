import type { Metadata } from 'next';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import CloudinaryImage from '@/components/common/CloudinaryImage';
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

const GREETING_PLACEHOLDER = '담임목사 인사말이 곧 게시될 예정입니다. 잠시만 기다려 주세요.';

export default async function PastorPage() {
  const { pastor } = await getPastorPageData();

  const name = pastor?.name ?? 'OOO';
  const title = pastor?.title ?? '담임목사';
  const careerSource = pastor ? [...pastor.education, ...pastor.experience] : [];
  const career = careerSource.length > 0 ? careerSource : ['준비 중'];
  const greetingParagraphs =
    pastor && pastor.greetingParagraphs.length > 0
      ? pastor.greetingParagraphs
      : [GREETING_PLACEHOLDER];

  return (
    <LayoutContainer className={styles.container}>
      <div className={styles.grid}>
        {/* 좌측 (PC) / 상단 (Mobile): 사진 + 이름 + career 카드 */}
        <aside className={styles.profile_block}>
          <div className={styles.photo}>
            {pastor?.imageUrl ? (
              <CloudinaryImage
                src={pastor.imageUrl}
                alt={`${name} 담임목사`}
                fill
                sizes="(max-width: 768px) 100vw, 20rem"
                style={{ objectFit: 'cover' }}
              />
            ) : (
              <span aria-hidden="true">PASTOR PHOTO</span>
            )}
          </div>
          <div>
            <p className={styles.eyebrow}>SENIOR PASTOR</p>
            <p className={styles.name_line}>
              <span className={styles.name}>{name}</span>
              <span className={styles.role}>{title}</span>
            </p>
          </div>
          <section className={styles.career_card}>
            <p className={styles.career_label}>CAREER</p>
            <ul className={styles.career_list}>
              {career.map((line, index) => (
                <li key={index} className={styles.career_item}>
                  <span className={styles.career_dot} aria-hidden="true" />
                  {line}
                </li>
              ))}
            </ul>
          </section>
        </aside>

        {/* 우측 (PC) / 본문 (Mobile): 인사말 + signature */}
        <article className={styles.content}>
          <h2 className={styles.lead}>
            “복음 위에 서서,
            <br />
            이웃의 자리에서 함께 걷겠습니다”
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
      </div>
    </LayoutContainer>
  );
}
