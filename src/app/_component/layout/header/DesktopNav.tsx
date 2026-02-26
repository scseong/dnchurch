import Link from 'next/link';
import { sitemap } from '@/constants/sitemap';
import styles from './index.module.scss';

export default function DesktopNav() {
  return (
    <nav className={styles.desktop_nav}>
      <ul>
        {sitemap
          .filter((item) => item.show)
          .map((item, index) => (
            <li key={index}>
              <Link href={item.path}>{item.label}</Link>
            </li>
          ))}
      </ul>
    </nav>
  );
}
