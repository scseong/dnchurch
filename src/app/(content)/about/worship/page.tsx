import type { Metadata } from 'next';
import Link from 'next/link';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '예배안내',
  description:
    '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)',
  openGraph: {
    title: '예배안내',
    description:
      '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)'
  }
};

const WORSHIP_STATEMENT = {
  title: '우리가 드리는 예배',
  quote: '하나님은 영이시니 예배하는 자가 영과 진리로 예배할지니라',
  quoteRef: '요한복음 4:24',
  desc: '대구동남교회는 말씀과 기도, 찬양을 중심으로 모든 세대가 함께 예배합니다.'
};

type WorshipItem = {
  name: string;
  time: string;
  place: string;
  age?: string;
};

type WorshipType = {
  id: 'sunday' | 'weekday' | 'school';
  en: string;
  label: string;
  items: WorshipItem[];
  cta?: string;
  ctaHref?: string;
};

const WORSHIP_TYPES: WorshipType[] = [
  {
    id: 'sunday',
    en: 'SUNDAY',
    label: '주일에 함께 모이는 예배',
    items: [
      { name: '주일낮예배', time: '오전 11:00', place: '대예배실' },
      { name: '주일저녁예배', time: '오후 06:00', place: '대예배실' }
    ]
  },
  {
    id: 'weekday',
    en: 'WEEKDAY',
    label: '주중에 드리는 기도회',
    items: [
      { name: '새벽기도회', time: '월~토 오전 05:30', place: '소예배실' },
      { name: '수요기도회', time: '수요일 오후 07:00', place: '대예배실' },
      { name: '금요기도회', time: '금요일 오후 08:00', place: '대예배실' }
    ]
  },
  {
    id: 'school',
    en: 'SCHOOL',
    label: '자녀와 함께',
    items: [
      { name: '유치부', age: '5–7세', time: '오전 09:00', place: '소예배실' },
      { name: '초등부', age: '1–6학년', time: '오전 09:00', place: '교육관' },
      { name: '중고등부', age: '중1–고3', time: '오전 09:00', place: '교육관' },
      { name: '청년부', age: '20–30대', time: '오후 01:30', place: '대예배실' }
    ],
    cta: '자세히 보기',
    ctaHref: '/next-gen'
  }
];

const WELCOME = {
  greeting: '처음 오신 분께',
  guide:
    '주일낮예배는 오전 11시, 대예배실에서 드립니다. 예배 10분 전까지 오시면 안내를 받으실 수 있습니다.',
  ctas: [
    { label: '오시는 길', href: '/about/location' },
    // TODO: 주차 안내 페이지 경로로 교체
    { label: '주차 안내', href: '#' },
    { label: '새가족 안내', href: '/about/welcome' }
  ]
};

export default function Worship() {
  return (
    <LayoutContainer className={styles.container}>
      {/* 1. 우리가 드리는 예배 */}
      <section className={styles.statement}>
        <div className={styles.statement_head}>
          <h2 className={styles.statement_title}>{WORSHIP_STATEMENT.title}</h2>
          <span className={styles.statement_underline} aria-hidden="true" />
        </div>
        <div className={styles.statement_body}>
          <blockquote className={styles.statement_quote}>
            “{WORSHIP_STATEMENT.quote}”
          </blockquote>
          <p className={styles.statement_ref}>{WORSHIP_STATEMENT.quoteRef}</p>
          <p className={styles.statement_desc}>{WORSHIP_STATEMENT.desc}</p>
        </div>
      </section>

      {/* 2. 카드 그리드 */}
      <section className={styles.cards_grid}>
        {WORSHIP_TYPES.map((type) => (
          <article key={type.id} className={styles.card} data-type={type.id}>
            <header className={styles.card_head}>
              <div className={styles.card_head_meta}>
                <p className={styles.card_eyebrow}>{type.en}</p>
                <h3 className={styles.card_title}>{type.label}</h3>
              </div>
              {type.cta && (
                <Link href={type.ctaHref ?? '#'} className={styles.card_cta}>
                  {type.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </header>
            <ul className={styles.schedule_list}>
              {type.items.map((item, index) => (
                <li key={index} className={styles.schedule_row}>
                  <div className={styles.schedule_meta}>
                    <p className={styles.schedule_name}>
                      <span>{item.name}</span>
                      {item.age && <span className={styles.schedule_age}>{item.age}</span>}
                    </p>
                    <p className={styles.schedule_place}>{item.place}</p>
                  </div>
                  <p className={styles.schedule_time}>{item.time}</p>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      {/* 3. 처음 오신 분께 */}
      <section className={styles.welcome}>
        <div className={styles.welcome_text}>
          <h3 className={styles.welcome_title}>{WELCOME.greeting}</h3>
          <p className={styles.welcome_guide}>{WELCOME.guide}</p>
        </div>
        <ul className={styles.welcome_ctas}>
          {WELCOME.ctas.map((cta) => (
            <li key={cta.label}>
              <Link href={cta.href} className={styles.welcome_cta}>
                {cta.label}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </LayoutContainer>
  );
}
