'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { sitemap } from '@/constants/sitemap';
import type { AppSitemapNode } from '@/types/layout';
import Dropdown from '@/components/layout/hero/Dropdown';
import styles from './Breadcrumb.module.scss';

const EXCLUDED_PATHS = new Set(['/', '/mypage', '/notifications', '/search']);

const navItems = sitemap.filter((item) => !item.detail && !EXCLUDED_PATHS.has(item.path));

/** pathname에 매칭되는 부모/자식 노드를 반환 */
function resolveCurrentNode(pathname: string) {
  for (const item of navItems) {
    if (item.children) {
      const child = item.children.find((c) => !c.detail && pathname.startsWith(c.path));
      if (child) return { parent: item, child };
    }
    if (pathname.startsWith(item.path)) return { parent: item, child: null };
  }
  return { parent: null, child: null };
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const { parent, child } = resolveCurrentNode(pathname);

  const staticChildren = parent?.children?.filter((c) => !c.detail) ?? [];
  const isParentActive = !!parent && staticChildren.length === 0;

  return (
    <nav className={styles.breadcrumb} aria-label="브레드크럼 내비게이션">
      <ol className={styles.list}>
        <li className={styles.item}>
          <Link href="/" className={styles.link}>
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

        {staticChildren.length > 0 && (
          <li className={styles.item}>
            <Dropdown
              label={child?.label ?? staticChildren[0].label}
              items={staticChildren.map((c: AppSitemapNode) => ({ path: c.path, label: c.label }))}
              currentPath={pathname}
              isActive
            />
          </li>
        )}
      </ol>
    </nav>
  );
}
