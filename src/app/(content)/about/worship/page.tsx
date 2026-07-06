import type { Metadata } from 'next';
import Link from 'next/link';
import clsx from 'clsx';
import { LuChevronRight } from 'react-icons/lu';
import MainContainer from '@/components/layout/container/MainContainer';
import { EmptyState } from '@/components/ui';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import { getWorshipPageData } from '@/services/about';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '예배안내',
  description:
    '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)',
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '예배안내',
    description:
      '대구동남교회 예배안내 - 주일낮예배(11:00), 주일저녁예배(18:00), 새벽기도회(05:30), 수요기도회(19:00), 금요기도회(20:00)'
  }
};

// 그룹별 정적 라벨 (페이지 디자인 — DB에 없음). 목업 카드 제목과 일치.
const GROUP_META = {
  sunday: { label: '주일 예배' },
  weekday: { label: '주중 예배·기도회' },
  school: {
    label: '다음세대 예배',
    cta: '다음세대 페이지 보기',
    ctaSub: '유치부부터 청년부까지, 자녀 세대 예배 안내',
    ctaHref: '/next-gen'
  }
} as const;

export default async function Worship() {
  const { groups } = await getWorshipPageData();

  const worshipGroups = [
    { id: 'sunday' as const, ...GROUP_META.sunday, items: groups.sunday },
    { id: 'weekday' as const, ...GROUP_META.weekday, items: groups.weekday },
    { id: 'school' as const, ...GROUP_META.school, items: groups.school }
  ];

  return (
    <>
      <h1 className={styles.sr_only}>예배 안내</h1>
      <MainContainer title="예배 안내">
        <div className={styles.page}>
          {worshipGroups.map((group) => (
            <section key={group.id} className={styles.section}>
              <div className={styles.section_head}>
                <h2 className={styles.section_title}>{group.label}</h2>
              </div>
              {group.items.length > 0 ? (
                <div className={styles.card}>
                  {group.items.map((item) => (
                    <div key={item.id} className={styles.row}>
                      <div className={styles.row_main}>
                        <p className={styles.name_line}>
                          <span className={clsx(styles.name, item.is_featured && styles.name_featured)}>
                            {item.name}
                          </span>
                          {item.age_group && <span className={styles.age}>{item.age_group}</span>}
                        </p>
                        <p className={styles.place}>{item.location}</p>
                      </div>
                      <p className={styles.time}>{item.time}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="예배 일정 준비 중" size="compact" />
              )}
              {'cta' in group && (
                <Link href={group.ctaHref} className={styles.cta_button}>
                  <span className={styles.cta_body}>
                    <span className={styles.cta_title}>{group.cta}</span>
                    <span className={styles.cta_sub}>{group.ctaSub}</span>
                  </span>
                  <LuChevronRight className={styles.cta_chevron} aria-hidden />
                </Link>
              )}
            </section>
          ))}
        </div>
      </MainContainer>
    </>
  );
}
