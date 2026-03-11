'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Dropdown from '@/components/layout/hero/Dropdown';
import { sitemap } from '@/constants/sitemap';
import { resolveCurrentNode } from '@/utils/sitemap';
import styles from './Breadcrumb.module.scss';

export default function Breadcrumb() {
  const pathname = usePathname();
  const { parent, child } = resolveCurrentNode(pathname);

  const navItems = sitemap.filter((i) => i.inNav);

  const isParentActive = !!parent && !parent.children;
  const isChildActive = true;

  return (
    <nav className={styles.breadcrumb} aria-label="브레드크럼 내비게이션">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.link}>
            {/* <span>Home</span> */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </Link>
        </li>

        {parent && (
          <li className={styles.item}>
            <Dropdown
              label={parent.label}
              items={navItems.map((i) => ({ path: i.path, label: i.label }))}
              currentPath={pathname}
              isActive={isParentActive}
            />
          </li>
        )}

        {parent?.children && (
          <li className={styles.item}>
            <Dropdown
              label={child?.label ?? parent.children[0].label}
              items={parent.children.map((c) => ({ path: c.path, label: c.label }))}
              currentPath={pathname}
              isActive={isChildActive}
            />
          </li>
        )}
      </ol>
    </nav>
  );
}
