import Link from 'next/link';
import styles from './Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header_wrap}>
        <div className={styles.logo}>
          <h1>
            <Link href="/">
              {/* TODO: 로고 이미지로 대체 */}
              대구동남교회
            </Link>
          </h1>
        </div>
        <nav className={styles.nav}>
          <ul>
            <li>
              <Link href="/about">교회소개</Link>
            </li>
            <li>
              <Link href="/news">교회소식</Link>
            </li>
            <li>
              <Link href="/fellowship">교제</Link>
            </li>
            <li>
              <Link href="/gallery">동남앨범</Link>
            </li>
          </ul>
        </nav>
        <div className={styles.auth}>
          <ul>
            <li>
              {/* TODO: 모달로 구현 */}
              <Link href="/login">로그인</Link>
            </li>
            <li>회원가입</li>
          </ul>
        </div>
      </div>
    </header>
  );
}
