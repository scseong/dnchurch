'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import clsx from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import styles from './HeroCarousel.module.scss';

type HeroCta = { label: string; href: string; variant: 'primary' | 'ghost' };

export type HeroSlide = {
  eyebrow: string;
  title: string;
  lines: string[];
  tone: 'welcome' | 'worship' | 'visit';
  ctas: HeroCta[];
};

const AUTOPLAY_MS = 5500;

export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: AUTOPLAY_MS, stopOnInteraction: false, stopOnMouseEnter: true })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi]);

  return (
    <section className={styles.section} aria-roledescription="캐러셀" aria-label="대표 안내">
      <div className={styles.viewport}>
        <div className={styles.embla} ref={emblaRef}>
          <div className={styles.container}>
            {slides.map((slide, index) => (
              <div
                key={slide.title}
                className={clsx(styles.slide, styles[slide.tone])}
                aria-hidden={index !== selectedIndex}
                inert={index !== selectedIndex ? true : undefined}
              >
                <span className={styles.scrim} aria-hidden="true" />
                <div className={styles.content}>
                  <span className={styles.eyebrow}>{slide.eyebrow}</span>
                  <h2 className={styles.title}>{slide.title}</h2>
                  <p className={styles.subtitle}>
                    {slide.lines.map((line) => (
                      <span key={line} className={styles.line}>
                        {line}
                      </span>
                    ))}
                  </p>
                  <div className={styles.ctas}>
                    {slide.ctas.map((cta) => (
                      <Link
                        key={cta.label}
                        href={cta.href}
                        className={clsx(styles.cta, styles[cta.variant])}
                      >
                        {cta.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.dots}>
          {slides.map((slide, index) => (
            <button
              key={slide.title}
              type="button"
              className={clsx(styles.dot, index === selectedIndex && styles.dot_active)}
              onClick={() => scrollTo(index)}
              aria-label={`${index + 1}번째 슬라이드 보기`}
              aria-current={index === selectedIndex}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
