import Link from 'next/link';
import { LayoutContainer } from '@/components/layout';
import styles from './QuickAccess.module.scss';

const ITEMS = [
  { href: '/about/worship', label: '예배 시간', Icon: ClockIcon },
  { href: '/about/location', label: '오시는 길', Icon: MapPinIcon },
  { href: '/sermons', label: '지난 설교', Icon: BookmarkIcon },
  { href: '/next-gen', label: '다음세대', Icon: UsersIcon }
];

export default function QuickAccess() {
  return (
    <section className={styles.section}>
      <LayoutContainer>
        <nav aria-label="빠른 메뉴">
          <ul className={styles.grid}>
            {ITEMS.map(({ href, label, Icon }) => (
              <li key={label}>
                <Link href={href} className={styles.item}>
                  <span className={styles.icon_box} aria-hidden="true">
                    <Icon />
                  </span>
                  <span className={styles.label}>{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </LayoutContainer>
    </section>
  );
}

function IconBase({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function ClockIcon() {
  return (
    <IconBase>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  );
}

function MapPinIcon() {
  return (
    <IconBase>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </IconBase>
  );
}

function BookmarkIcon() {
  return (
    <IconBase>
      <path d="M5 5v14l7-3 7 3V5" />
      <path d="m9 11 2 2 4-4" />
    </IconBase>
  );
}

function UsersIcon() {
  return (
    <IconBase>
      <circle cx="9" cy="7" r="3" />
      <path d="M4 21v-2a5 5 0 0 1 10 0v2" />
      <circle cx="17" cy="9" r="2" />
    </IconBase>
  );
}
