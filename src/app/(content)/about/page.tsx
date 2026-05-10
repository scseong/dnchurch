import type { Metadata } from 'next';
import Link from 'next/link';
import { LuClock, LuTrainFront } from 'react-icons/lu';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import { getHubPageData } from '@/services/about';
import { displaySettingValue } from '@/utils/site-settings';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '교회 소개 - 대구동남교회',
  description: '대구동남교회를 소개합니다',
  openGraph: {
    title: '교회 소개 - 대구동남교회',
    description: '대구동남교회를 소개합니다'
  }
};

const GALLERY = [
  { tag: '본당', caption: '예배의 중심' },
  { tag: '예배', caption: '주일 모임' },
  { tag: '공동체', caption: '함께하는 자리' },
  { tag: '다음세대', caption: '교회학교' }
];

const HUB_ITEM_CARDS = [
  {
    id: '01',
    label: 'GREETINGS',
    title: '인사말',
    tag: '담임목사가 전하는 첫 인사',
    href: '/about/pastor'
  },
  {
    id: '02',
    label: 'VISION',
    title: '교회의 비전',
    tag: '우리가 바라보는 방향',
    href: '/about/vision'
  },
  {
    id: '03',
    label: 'WORSHIP',
    title: '예배 안내',
    tag: '주일·평일·교회학교',
    href: '/about/worship'
  },
  {
    id: '04',
    label: 'WELCOME',
    title: '환영합니다',
    tag: '처음 오시는 분께',
    href: '/about/welcome',
    featured: true
  }
];

export default async function AboutHub() {
  const { history, settings } = await getHubPageData();

  const setupYear = history[0]?.year ?? '—';
  const stats = [
    { num: setupYear, label: '설립' },
    // TODO: 사역 수·교구 수·기도일 — admin 입력 시점에 site_settings 또는 새 collection으로
    { num: 'TODO', label: '사역' },
    { num: 'TODO', label: '교구' },
    { num: 'TODO', label: '기도일' }
  ];
  const historyMini = history.slice(0, 4);

  const address = displaySettingValue(settings.church_address, '준비 중');
  const phone = displaySettingValue(settings.church_phone, '');
  const zipcode = displaySettingValue(settings.church_zipcode, '');
  const subway = displaySettingValue(settings.directions_subway, '준비 중');
  const sundayHours = displaySettingValue(settings.opening_hours_sunday, '준비 중');

  const locationMeta = [zipcode, phone].filter(Boolean).join(' · ') || '준비 중';

  return (
    <>
      {/* Self Hero — 다크 영역 (layout auto-Hero는 /about에서 null 반환이라 충돌 없음) */}
      <section className={styles.hero}>
        <LayoutContainer className={styles.hero_inner}>
          <p className={styles.hero_eyebrow}>ABOUT — 2026</p>
          <h1 className={styles.hero_title}>
            복음 위에 서서,
            <br />
            이웃과 함께 자라는 교회.
          </h1>
          <p className={styles.hero_desc}>
            1952년에 설립되어, 오늘도 같은 자리에서 이웃과 함께합니다.
          </p>
          <div className={styles.stats}>
            {stats.map((stat) => (
              <div key={stat.label} className={styles.stat_item}>
                <p className={styles.stat_num}>{stat.num}</p>
                <p className={styles.stat_label}>{stat.label}</p>
              </div>
            ))}
          </div>
        </LayoutContainer>
      </section>

      <LayoutContainer className={styles.body}>
        {/* GALLERY */}
        <section className={styles.gallery_section}>
          <header className={styles.row_head}>
            <span className={styles.row_label}>GALLERY</span>
            <span className={styles.row_line} aria-hidden="true" />
          </header>
          <div className={styles.gallery_grid}>
            {GALLERY.map((item) => (
              <div key={item.tag} className={styles.gallery_card}>
                <div className={styles.gallery_pattern} aria-hidden="true" />
                <div className={styles.gallery_content}>
                  <span className={styles.gallery_tag}>{item.tag}</span>
                  <p className={styles.gallery_caption}>{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* INDEX 4 cards */}
        <section className={styles.index_section}>
          <header className={styles.row_head}>
            <span className={styles.row_label}>INDEX</span>
            <span className={styles.row_line} aria-hidden="true" />
            <span className={styles.row_count}>04 PAGES</span>
          </header>
          <div className={styles.index_grid}>
            {HUB_ITEM_CARDS.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={styles.index_card}
                data-featured={item.featured ? 'true' : undefined}
              >
                <div>
                  <p className={styles.index_meta}>
                    {item.id} · {item.label}
                  </p>
                  <p className={styles.index_title}>{item.title}</p>
                  <p className={styles.index_tag}>{item.tag}</p>
                </div>
                <span className={styles.index_arrow} aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* HISTORY + LOCATION mini */}
        <section className={styles.bottom_grid}>
          <div className={styles.bottom_card}>
            <header className={styles.bottom_head}>
              <span className={styles.bottom_label}>HISTORY · 걸어온 길</span>
              <Link href="/about/vision" className={styles.bottom_link}>
                자세히 →
              </Link>
            </header>
            <ol className={styles.history_timeline}>
              {historyMini.map((item, index) => (
                <li key={index} className={styles.history_node}>
                  <span className={styles.history_dot} aria-hidden="true" />
                  <p className={styles.history_year}>{item.year}</p>
                  <p className={styles.history_text}>{item.text}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className={styles.bottom_card}>
            <header className={styles.bottom_head}>
              <span className={styles.bottom_label}>LOCATION · 오시는 길</span>
              <Link href="/about/location" className={styles.bottom_link}>
                지도 →
              </Link>
            </header>
            <p className={styles.location_address}>{address}</p>
            <p className={styles.location_meta}>{locationMeta}</p>
            <div className={styles.location_extra}>
              <p>
                <LuTrainFront aria-hidden="true" />
                {subway}
              </p>
              <p>
                <LuClock aria-hidden="true" />
                {sundayHours}
              </p>
            </div>
          </div>
        </section>
      </LayoutContainer>
    </>
  );
}
