import Link from 'next/link';
import { CHURCH_INFO } from '@/config/seo';
import styles from './Footer.module.scss';

const { addressRegion, addressLocality, streetAddress } = CHURCH_INFO.address;
const ADDRESS = `${addressRegion} ${addressLocality} ${streetAddress}`;

// 예배안내는 worship_schedules(SSOT)를 app 레이어((content)/layout)에서 fetch해 주입한다.
// components/는 services/를 직접 import할 수 없어(레이어 규칙) props로 받는다. 전체 일정은 /about/worship.
type FooterProps = { worshipLine: string };

function LeafIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 9-4 15-9 15Z" />
      <path d="M4 20c4-1 7-4 12-9" />
    </svg>
  );
}

export default function Footer({ worshipLine }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.brand}>
          <span className={styles.logo}>
            <LeafIcon />
          </span>
          <span className={styles.name}>대구동남교회</span>
        </div>

        <dl className={styles.info}>
          {worshipLine && (
            <div className={styles.row}>
              <dt className={styles.label}>예배안내</dt>
              <dd className={styles.value}>{worshipLine}</dd>
            </div>
          )}
          <div className={styles.row}>
            <dt className={styles.label}>오시는길</dt>
            <dd className={styles.value}>{ADDRESS}</dd>
          </div>
        </dl>
      </div>

      <div className={styles.bottom}>
        <span className={styles.copyright}>© 2026 대구동남교회</span>
        <Link href="/privacy-policy" className={styles.policy}>
          개인정보처리방침
        </Link>
      </div>
    </footer>
  );
}
