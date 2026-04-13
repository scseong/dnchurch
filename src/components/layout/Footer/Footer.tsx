import Link from 'next/link';
import LayoutContainer from '@/components/layout/container/LayoutContainer';
import styles from './Footer.module.scss';

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.13C5.12 19.56 12 19.56 12 19.56s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function KakaoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3C6.48 3 2 6.58 2 10.94c0 2.8 1.86 5.27 4.66 6.67l-.9 3.35c-.08.28.24.5.48.34l3.9-2.58c.6.08 1.22.13 1.86.13 5.52 0 10-3.58 10-7.91S17.52 3 12 3z" />
    </svg>
  );
}

const CHURCH_LINKS = [
  { label: '인사말', href: '/about/pastor' },
  { label: '교회 비전', href: '/about/vision' },
  { label: '오시는 길', href: '/about/location' },
  { label: '예배 안내', href: '/about/worship' },
];

const NEWS_LINKS = [
  { label: '주보', href: '/news/bulletins' },
  { label: '설교', href: '/sermons' },
  { label: '공지사항', href: '/news/notices' },
  { label: '갤러리', href: '/news/gallery' },
];

const SNS_LINKS = [
  { label: 'YouTube', icon: <YoutubeIcon />, href: '#' },
  { label: 'Instagram', icon: <InstagramIcon />, href: '#' },
  { label: 'Facebook', icon: <FacebookIcon />, href: '#' },
  { label: 'KakaoTalk', icon: <KakaoIcon />, href: '#' },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <LayoutContainer>
        <div className={styles.footer_grid}>
          {/* 브랜드 */}
          <div className={styles.footer_brand}>
            <p className={styles.footer_logo}>대구동남교회</p>
            <p className={styles.footer_slogan}>
              주님의 기도를 배우는 교회
              <br />
              동남교회
            </p>
            <div className={styles.footer_sns}>
              {SNS_LINKS.map((sns) => (
                <a
                  key={sns.label}
                  href={sns.href}
                  className={styles.footer_sns_btn}
                  aria-label={sns.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {sns.icon}
                </a>
              ))}
            </div>
          </div>

          {/* 교회 안내 */}
          <div className={styles.footer_col}>
            <h3 className={styles.footer_col_title}>교회 안내</h3>
            <ul className={styles.footer_col_list}>
              {CHURCH_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.footer_col_link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 소식 · 말씀 */}
          <div className={styles.footer_col}>
            <h3 className={styles.footer_col_title}>소식 · 말씀</h3>
            <ul className={styles.footer_col_list}>
              {NEWS_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.footer_col_link}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className={styles.footer_col}>
            <h3 className={styles.footer_col_title}>Contact</h3>
            <address className={styles.footer_address}>
              <p>대구 달서구 달구벌대로307길 58</p>
              <p>053-552-3403</p>
              <p>053-561-2787</p>
            </address>
          </div>
        </div>

        {/* 카피라이트 */}
        <div className={styles.footer_bottom}>
          <p className={styles.footer_copyright}>
            &copy; 2026 DONGNAM CHURCH. ALL RIGHTS RESERVED.
          </p>
          <div className={styles.footer_bottom_links}>
            <a href="#">개인정보처리방침</a>
            <a href="#">이용약관</a>
            <span>DESIGNED BY SCSEONG</span>
          </div>
        </div>
      </LayoutContainer>
    </footer>
  );
}
