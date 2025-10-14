import Link from 'next/link';
import { sitemap } from '@/shared/constants/sitemap';
import styles from './index.module.scss';

type Props = {
  isVisible: boolean;
};

export default function DesktopNav({ isVisible }: Props) {
  return (
    <nav className={`${styles.nav} ${isVisible ? styles.visible : styles.invisible}`}>
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
