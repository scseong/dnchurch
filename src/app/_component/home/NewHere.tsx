'use client';

import { useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import CloudinaryImage from '@/components/common/CloudinaryImage';
import { LayoutContainer } from '@/components/layout';
import { revealStyle, REVEAL_STEP_CONTENT } from '@/utils/reveal';
import styles from './NewHere.module.scss';

const FAQ_ITEMS: { question: string; answer: string; link?: { href: string; label: string } }[] = [
  {
    question: '예배는 언제, 어디서 드리나요?',
    answer:
      '주일오전예배는 매주 일요일 오전 11시, 수요예배는 매주 수요일 저녁 7시에 드립니다. 주소는 대구광역시 달서구 달구벌대로307길 58입니다.',
    link: { href: '/about', label: '예배안내 보기 →' }
  },
  {
    question: '대구동남교회는 어떤 교회인가요?',
    answer:
      '대한예수교장로회(합신) 소속의 개혁주의 교회로, 바른 신학·바른 교회·바른 생활을 지향합니다. 성경 본문에 충실한 강해 설교와 경건한 예배를 통해 성도의 삶을 세워갑니다.'
  },
  {
    question: '처음 가는데 특별히 준비할 게 있나요?',
    answer:
      '편한 마음으로 오시면 됩니다. 별도의 드레스코드는 없으며, 새가족 담당자가 따뜻하게 맞이해 드립니다.'
  },
  {
    question: '아이들과 함께 가도 되나요?',
    answer:
      '물론입니다. 영아부부터 고등부까지 연령별 맞춤 교회학교를 운영하고 있어, 안전한 환경에서 예배드릴 수 있습니다.'
  }
];

export default function NewHere() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const handleToggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section className={styles.section} id="new-here">
      <LayoutContainer>
        <div className={styles.inner}>
          {/* 좌측: 교회 이미지 (PC only) */}
          <div className={styles.image_area} data-reveal style={revealStyle()}>
            <div className={styles.image_sticky}>
              <div className={styles.image_frame}>
                <CloudinaryImage
                  src="dnchurch-dev/site/home/sketch"
                  alt="대구동남교회 전경"
                  width={600}
                  height={800}
                  sizes="50vw"
                  cropMode="fill"
                  gravity="auto"
                  aspectRatio="3:4"
                  className={styles.image}
                />
              </div>
              <div className={styles.year_badge}>
                <span className={styles.year_number}>1958</span>
                <span className={styles.year_label}>설립연도</span>
              </div>
            </div>
          </div>

          {/* 우측: 텍스트 + FAQ */}
          <div className={styles.content} data-reveal style={revealStyle(REVEAL_STEP_CONTENT)}>
            <div className={styles.header}>
              <span className={styles.caption}>Welcome</span>
              <h2 className={styles.title}>
                처음 오셨나요?
                <br />
                <strong>환영합니다!</strong>
              </h2>
              <div className={styles.divider} />
              <p className={styles.desc}>
                동남교회의 모든 예배는 언제나 누구에게나 열려 있습니다.
                <br />
                방문하기 전 궁금하신 점들을 미리 확인해 보세요.
              </p>
            </div>

            <div className={styles.faq_list}>
              {FAQ_ITEMS.map((item, index) => (
                <div
                  key={item.question}
                  className={clsx(styles.faq_item, openIndex === index && styles.faq_open)}
                >
                  <button
                    type="button"
                    className={styles.faq_question}
                    onClick={() => handleToggle(index)}
                    aria-expanded={openIndex === index}
                  >
                    <span>{item.question}</span>
                    <span className={styles.faq_toggle} aria-hidden="true">
                      +
                    </span>
                  </button>
                  <div className={styles.faq_answer}>
                    <div className={styles.faq_answer_inner}>
                      <p className={styles.faq_answer_text}>{item.answer}</p>
                      {item.link && (
                        <Link href={item.link.href} className={styles.faq_link}>
                          {item.link.label}
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/newcomer" className={styles.cta_link}>
              새가족부 안내 보기 →
            </Link>
          </div>
        </div>
      </LayoutContainer>
    </section>
  );
}
