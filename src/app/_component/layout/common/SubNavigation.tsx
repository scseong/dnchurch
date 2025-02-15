import Link from 'next/link';
import styles from './SubNavigation.module.scss';

export default function SubNavigation({
  subPaths
}: {
  subPaths?: {
    path: string;
    label: string;
  }[];
}) {
  return (
    <nav className={styles.subnav}>
      <ul>
        {subPaths?.map((subItem) => (
          <li key={subItem.path}>
            <Link href={subItem.path}>{subItem.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
