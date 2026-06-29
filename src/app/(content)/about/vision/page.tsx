import type { Metadata } from 'next';
import { OPEN_GRAPH_BASE } from '@/config/seo';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '교회의 비전',
  description: '2025년 교회목표 - 주님의 기도를 배우는 교회(성도)',
  openGraph: {
    ...OPEN_GRAPH_BASE,
    title: '교회의 비전',
    description: '2025년 교회목표 - 주님의 기도를 배우는 교회(성도)'
  }
};

const VISION_DECLARATION = '복음 위에 서서, 이웃과 함께 자라는 교회';

const VISION_PILLARS = [
  {
    title: '진리 위에 세워진 교회',
    desc: '성경은 하나님의 말씀이며 신앙과 삶의 유일한 표준입니다. 개혁주의 신앙 고백 위에서 하나님을 바르게 알고, 그 진리 위에 모든 사역을 세워갑니다.'
  },
  {
    title: '말씀과 기도로 하나 되는 교회',
    desc: '교회는 하나님의 부르심을 받아 모인 언약 공동체입니다. 말씀 선포와 성례, 기도로 드리는 예배를 통해 하나님 앞에 서고, 서로를 향한 사랑으로 그리스도의 몸을 이루어 갑니다.'
  },
  {
    title: '세상 속에서 빛이 되는 교회',
    desc: '믿음은 삶 전체를 아우릅니다. 가정과 일터, 지역 사회 안에서 복음으로 살아가며, 다음 세대를 세우고 이웃을 섬기는 것이 우리에게 주어진 소명입니다.'
  }
] as const;

export default function Vision() {
  return (
    <>
      <h1 className={styles.sr_only}>교회의 비전</h1>
      <LayoutContainer body>
        <div className={styles.page}>
          <section className={styles.vision_hero}>
            <p className={styles.vision_eyebrow}>OUR VISION</p>
            <p className={styles.vision_declaration}>{VISION_DECLARATION}</p>
          </section>

          <section>
            <div className={styles.section_head}>
              <h2 className={styles.section_title}>세 가지 비전</h2>
            </div>
            <ol className={styles.vision_list}>
              {VISION_PILLARS.map((pillar, index) => (
                <li key={pillar.title} className={styles.vision_card}>
                  <div className={styles.vision_card_head}>
                    <span className={styles.vision_num}>{index + 1}</span>
                    <h3 className={styles.vision_card_title}>{pillar.title}</h3>
                  </div>
                  <p className={styles.vision_card_desc}>{pillar.desc}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </LayoutContainer>
    </>
  );
}
