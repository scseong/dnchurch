import Link from 'next/link';
import { PiCalendarLight, PiBookOpenLight, PiMapPinLight, PiArrowRight } from 'react-icons/pi';
import { LayoutContainer } from '@/components/layout';
import IconWrap from '@/components/common/IconWrap';
import { getRevealStyle } from '@/utils/reveal';
import styles from './QuickAccess.module.scss';

const ITEMS = [
  {
    href: '/about',
    label: '예배 안내',
    desc: '주일 및 평일 예배 시간 안내',
    Icon: PiCalendarLight
  },
  {
    href: '/about',
    label: '담임목사 인사말',
    desc: '2026년 말씀 메시지 ',
    Icon: PiBookOpenLight
  },
  {
    href: '/about/directions',
    label: '오시는 길',
    desc: '교회 위치 및 교통편 안내',
    Icon: PiMapPinLight
  }
];

export default function QuickAccess() {
  return (
    <section className={styles.quick_wrap}>
      <LayoutContainer className={styles.quick_container}>
        <nav aria-label="퀵 액세스">
          <ul className={styles.quick_access}>
            {ITEMS.map(({ href, label, desc, Icon }, i) => (
              <li key={href}>
                <Link href={href} className={styles.item} data-reveal style={getRevealStyle(i)}>
                  <IconWrap Icon={Icon} className={styles.icon_box} aria-hidden="true" />
                  <div className={styles.text}>
                    <span className={styles.label}>{label}</span>
                    <span className={styles.desc}>{desc}</span>
                  </div>
                  <IconWrap Icon={PiArrowRight} className={styles.arrow} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </LayoutContainer>
    </section>
  );
}
