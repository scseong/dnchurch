import LayoutContainer from '@/components/layout/container/LayoutContainer';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { getPastorPageData } from '@/services/about';
import { CHURCH_INFO } from '@/config/seo';
import styles from './PastorGreeting.module.scss';

const GREETING_PLACEHOLDER = '담임목사 인사말이 곧 게시될 예정입니다. 잠시만 기다려 주세요.';

// 합신 교단 이념 — 교단 공식 표어. CHURCH_INFO.legalName으로 소속 확인.
const DENOMINATION_PRINCIPLES = [
  { label: '바른 신학', ref: '딤전 6:3, 딤후 1:13' },
  { label: '바른 교회', ref: '딤전 3:15' },
  { label: '바른 생활', ref: '약 1:27' }
];

/** 인사말 화면 — /about과 /about/pastor가 공유한다. metadata·canonical은 각 page가 소유. */
export default async function PastorGreeting() {
  const { pastor, history } = await getPastorPageData();

  const name = pastor?.name ?? '준비 중';
  const title = pastor?.title ?? '담임목사';
  const career = pastor ? [...pastor.education, ...pastor.experience] : [];
  const greetingParagraphs =
    pastor && pastor.greetingParagraphs.length > 0
      ? pastor.greetingParagraphs
      : [GREETING_PLACEHOLDER];
  const visibleHistory = history.filter(
    (item): item is NonNullable<typeof item> => Boolean(item) && item.year !== 'TODO'
  );
  const signatureText = pastor ? `${title} ${name} 드림` : '대구동남교회 드림';

  return (
    <>
      <h1 className={styles.sr_only}>인사말</h1>
      <LayoutContainer body>
        <div className={styles.page}>
          {/* 담임목사 카드 + 인사말 */}
          <article className={styles.pastor_card}>
            <div className={styles.pastor_head}>
              <div className={styles.photo_frame}>
                <div className={styles.photo}>
                  {pastor?.imageUrl ? (
                    <CloudinaryImage
                      src={pastor.imageUrl}
                      alt={`${name} ${title}`}
                      fill
                      sizes="16rem"
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <span aria-hidden="true">목사님 사진</span>
                  )}
                </div>
              </div>
              <p className={styles.role_label}>{title}</p>
              <p className={styles.pastor_name}>{pastor ? `${name} 목사` : name}</p>
            </div>

            <div className={styles.divider} />

            <div className={styles.greeting}>
              {greetingParagraphs.map((paragraph, index) => (
                <p key={index} className={styles.greeting_p}>
                  {paragraph}
                </p>
              ))}
            </div>

            <p className={styles.signature}>{signatureText}</p>
          </article>

          {/* 목사님 약력 */}
          {career.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.section_title}>목사님 약력</h2>
              <div className={styles.list_card}>
                {career.map((line, index) => (
                  <div key={index} className={styles.list_row}>
                    <span className={styles.dot} aria-hidden="true" />
                    <span className={styles.list_text}>{line}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 교회 이력 */}
          {visibleHistory.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles.section_title}>교회 이력</h2>
              <div className={styles.history_card}>
                {visibleHistory.map((item, index) => (
                  <div key={index} className={styles.history_row}>
                    <span className={styles.history_year}>{item.year}</span>
                    <div className={styles.history_main}>
                      <span className={styles.history_dot} aria-hidden="true" />
                      <p className={styles.history_text}>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 교단 소개 */}
          <section className={styles.section}>
            <h2 className={styles.section_title}>교단 소개</h2>
            <div className={styles.denom_card}>
              <p className={styles.denom_text}>
                {CHURCH_INFO.name}는 ‘
                {DENOMINATION_PRINCIPLES.map((principle, index) => (
                  <span key={principle.label}>
                    <b className={styles.denom_strong}>{principle.label}</b>
                    <span className={styles.denom_ref}> ({principle.ref})</span>
                    {index < DENOMINATION_PRINCIPLES.length - 1 ? ', ' : ''}
                  </span>
                ))}
                ’을 이념으로 성경적 개혁주의 신학을 따르는 교단에 속해 있습니다.
              </p>
              <div className={styles.denom_meta}>
                <div className={styles.denom_meta_text}>
                  <p className={styles.denom_label}>정식 명칭</p>
                  <b className={styles.denom_name}>{CHURCH_INFO.legalName}</b>
                </div>
                {/* eslint-disable-next-line @next/next/no-img-element -- 정적 /public 브랜드 SVG(변환 불필요) */}
                <img className={styles.denom_logo} src="/images/logo.svg" alt="대한예수교장로회(합신)" />
              </div>
            </div>
          </section>
        </div>
      </LayoutContainer>
    </>
  );
}
