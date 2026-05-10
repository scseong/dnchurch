import type { Metadata } from 'next';
import { LuBookOpen, LuFlame, LuHandshake } from 'react-icons/lu';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { getVisionPageData } from '@/services/about';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: '교회의 비전 - 대구동남교회',
  description: '2025년 교회목표 - 주님의 기도를 배우는 교회(성도)',
  openGraph: {
    title: '교회의 비전 - 대구동남교회',
    description: '2025년 교회목표 - 주님의 기도를 배우는 교회(성도)'
  }
};

const IMAGE_URL = 'dnchurch_nxmttl';

const VISION = {
  slogan: '복음 위에 서서, 이웃과 함께 자라는 교회',
  enSlogan: 'ROOTED IN GOSPEL · GROWING WITH NEIGHBORS',
  pillars: [
    {
      num: '01',
      label: 'TRUTH',
      title: '진리 위에 세워진 교회',
      desc: '성경은 하나님의 말씀이며 신앙과 삶의 유일한 표준입니다. 개혁주의 신앙 고백 위에서 하나님을 바르게 알고, 그 진리 위에 모든 사역을 세워갑니다.',
      Icon: LuBookOpen,
    },
    {
      num: '02',
      label: 'WORSHIP',
      title: '말씀과 기도로 하나 되는 교회',
      desc: '교회는 하나님의 부르심을 받아 모인 언약 공동체입니다. 말씀 선포와 성례, 기도로 드리는 예배를 통해 하나님 앞에 서고, 서로를 향한 사랑으로 그리스도의 몸을 이루어 갑니다.',
      Icon: LuFlame,
    },
    {
      num: '03',
      label: 'LIFE',
      title: '세상 속에서 빛이 되는 교회',
      desc: '믿음은 삶 전체를 아우릅니다. 가정과 일터, 지역 사회 안에서 복음으로 살아가며, 다음 세대를 세우고 이웃을 섬기는 것이 우리에게 주어진 소명입니다.',
      Icon: LuHandshake,
    }
  ]
};

const VISION_STATEMENT = [
  '동남교회에 오신 것을 환영합니다.',
  '동남교회는 1952년에 설립된 이후, 하나님의 사랑을 나누고 믿음의 공동체를 세우기 위해 함께하는 곳입니다. 우리는 복음을 전파하여 더 많은 사람들이 예수 그리스도를 알게 되고 그 사랑을 경험하도록 힘쓰고 있습니다. 우리의 비전은 하나님의 사랑을 모든 이와 나누고, 서로를 격려하며 지지하는 믿음의 공동체를 형성하는 것입니다.',
  '우리는 함께 기도하고 성장하며, 복음을 확산시키는 사역에 헌신하고 있습니다. 지역 사회와 세계를 향한 사역을 통해, 많은 이들에게 하나님의 사랑과 은혜를 전하는 데 힘쓰고 있습니다. 또한, 우리는 다음 세대의 양육을 중요시하며, 어린이와 청소년들이 하나님을 경험하고 신앙을 심화할 수 있는 다양한 프로그램을 제공하고 있습니다.',
  '동남교회는 모든 사람이 하나님의 사랑을 경험하고, 믿음의 공동체 안에서 함께 성장할 수 있도록 최선을 다하고 있습니다. 우리는 각자의 재능과 은사를 활용하여 서로를 섬기고, 하나님의 사역에 동참하길 원합니다. 이러한 비전을 통해, 우리는 하나님께서 우리에게 주신 사명을 충실히 이행하며, 세상을 변화시키는 도구로 살아가고자 합니다.',
  '우리의 목표는 각 성도가 하나님과의 깊은 관계를 구축하고, 이웃과 사회에 긍정적인 영향을 미치는 것입니다. 우리는 함께 이 비전을 이루어 나가길 소망하며, 하나님께서 주신 사랑을 세상에 전하기 위해 끊임없이 노력할 것입니다.'
];

export default async function Vision() {
  const { history } = await getVisionPageData();

  return (
    <>
      <LayoutContainer className={styles.container}>
        {/* 슬로건 다크 카드 */}
        <section className={styles.slogan_card}>
          <p className={styles.slogan_eyebrow}>{VISION.enSlogan}</p>
          <h2 className={styles.slogan_title}>{VISION.slogan}</h2>
          <span className={styles.slogan_underline} aria-hidden="true" />
        </section>

        {/* VISION STATEMENT — 본문 5단락 + 이미지 */}
        <section className={styles.statement_section}>
          {/* <p className={styles.section_label}>VISION STATEMENT</p> */}
          <div className={styles.statement_grid}>
            <div className={styles.statement_text}>
              {VISION_STATEMENT.map((paragraph, index) => (
                <p
                  key={index}
                  className={index === 0 ? styles.statement_lead : styles.statement_paragraph}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className={styles.statement_image}>
              <CloudinaryImage
                src={IMAGE_URL}
                width={1920}
                height={1080}
                alt="대구동남교회 전경"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </div>
          </div>
        </section>

        {/* 3 PILLARS */}
        <section className={styles.pillars_section}>
          <h3 className={styles.pillars_title}>진리 · 공동체 · 삶으로 세워가는 교회</h3>
          <ol className={styles.pillars_list}>
            {VISION.pillars.map((pillar) => (
              <li key={pillar.num} className={styles.pillar_card}>
                <span className={styles.pillar_icon} aria-hidden="true">
                  <pillar.Icon />
                </span>
                <div className={styles.pillar_body}>
                  <p className={styles.pillar_meta}>
                    <span className={styles.pillar_num}>{pillar.num}</span>
                    <span className={styles.pillar_label}>· {pillar.label}</span>
                  </p>
                  <h4 className={styles.pillar_card_title}>{pillar.title}</h4>
                  <p className={styles.pillar_desc}>{pillar.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </LayoutContainer>

      {/* HISTORY — full-width */}
      <section className={styles.history_section}>
        <div className={styles.history_inner}>
          <header className={styles.history_head}>
            <p className={styles.history_eyebrow}>HISTORY</p>
            <h3 className={styles.history_title}>걸어온 길</h3>
          </header>
          <ol className={styles.history_list}>
            {history.map((item, index) => (
              <li key={index} className={styles.history_item}>
                <span className={styles.history_year}>{item.year}</span>
                <span className={styles.history_dot} aria-hidden="true" />
                <span className={styles.history_text}>{item.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
