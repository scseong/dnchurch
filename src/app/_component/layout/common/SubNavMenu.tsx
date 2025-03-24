import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SubNavMenu.module.scss';

export default function SubNavMenu({
  subPaths,
  segment
}: {
  subPaths?: {
    path: string;
    label: string;
  }[];
  segment: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={styles.subnav}>
      <ul>
        {subPaths?.map((subItem, idx) => (
          <li
            key={subItem.path}
            className={
              pathname.startsWith(subItem.path) || (segment === pathname && idx === 0)
                ? styles.isActive
                : styles.item
            }
          >
            <Link href={subItem.path}>{subItem.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
