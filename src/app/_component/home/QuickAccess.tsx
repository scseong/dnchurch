import Link from 'next/link';
import { PiCalendarLight, PiBookOpenLight, PiMapPinLight } from 'react-icons/pi';
import styles from './QuickAccess.module.scss';
import { LayoutContainer } from '@/components/layout';
import IconWrap from '@/components/common/IconWrap';
import { revealStyle, REVEAL_STEP, REVEAL_STEP_CONTENT } from '@/utils/reveal';

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
    desc: '담임목사님의 말씀을 전합니다',
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
    <section className={styles.quick_wap}>
      <LayoutContainer className={styles.quick_container}>
        <nav className={styles.quick_access} aria-label="퀵 액세스">
          {ITEMS.map(({ href, label, desc, Icon }, i) => (
            <Link
              key={label}
              href={href}
              className={styles.item}
              data-reveal
              style={revealStyle(REVEAL_STEP_CONTENT + (i + 1) * REVEAL_STEP)}
            >
              <IconWrap Icon={Icon} className={styles.icon_box} aria-hidden="true" />
              <span className={styles.text}>
                <span className={styles.label}>{label}</span>
                <span className={styles.desc}>{desc}</span>
              </span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>
      </LayoutContainer>
    </section>
  );
}
