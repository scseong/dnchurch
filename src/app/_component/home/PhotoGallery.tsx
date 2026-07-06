import Link from 'next/link';
import clsx from 'clsx';
import { LayoutContainer } from '@/components/layout';
import SectionHeader from './SectionHeader';
import styles from './PhotoGallery.module.scss';

const ITEMS = [
  { href: '/about/worship', label: '주일예배', tone: 'worship' },
  { href: '/about', label: '함께하는 교제', tone: 'fellowship' },
  { href: '/next-gen', label: '다음세대', tone: 'nextgen' }
] as const;

export default function PhotoGallery() {
  return (
    <section className={styles.section}>
      <LayoutContainer>
        <SectionHeader title="함께하는 대구동남교회" link={{ label: '전체', href: '/news/gallery' }} />
        <ul className={styles.scroller}>
          {ITEMS.map(({ href, label, tone }) => (
            <li key={label} className={styles.item}>
              <Link href={href} className={styles.card}>
                <span className={clsx(styles.thumb, styles[tone])} aria-hidden="true" />
                <span className={styles.label}>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </LayoutContainer>
    </section>
  );
}
