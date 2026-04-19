'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import {
  HiCheck,
  HiChevronLeft,
  HiChevronRight,
  HiOutlineCog,
  HiOutlineFolder,
  HiOutlineHome,
  HiOutlinePlay,
  HiOutlineUser,
  HiOutlineUsers
} from 'react-icons/hi';
import {
  ADMIN_NAV_SECTIONS,
  AdminIconName,
  isActiveAdminNav
} from '@/config/adminNavigation';
import styles from './index.module.scss';

const ICONS: Record<AdminIconName, ReactNode> = {
  home: <HiOutlineHome />,
  play: <HiOutlinePlay />,
  folder: <HiOutlineFolder />,
  user: <HiOutlineUser />,
  users: <HiOutlineUsers />,
  cog: <HiOutlineCog />
};

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function AdminSidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={clsx(
        styles.sidebar,
        collapsed && styles.collapsed,
        mobileOpen && styles.mobile_open
      )}
    >
      <div className={styles.brand}>
        <div className={styles.logo}>
          <HiCheck />
        </div>
        <span className={styles.title}>대구동남교회</span>
      </div>

      <nav className={styles.nav} aria-label="관리자 메뉴">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.title} className={styles.section}>
            <h3 className={styles.section_title}>{section.title}</h3>
            <ul className={styles.items}>
              {section.items.map((item) => {
                const active = isActiveAdminNav(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={clsx(styles.item, active && styles.on)}
                      onClick={onMobileClose}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span className={styles.icon}>{ICONS[item.icon]}</span>
                      <span className={styles.label}>{item.label}</span>
                      {item.badge && <span className={styles.badge}>{item.badge}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className={styles.footer}>
        <div className={styles.user}>
          <div className={styles.avatar}>관</div>
          <div className={styles.info}>
            <span className={styles.name}>관리자</span>
            <span className={styles.email}>admin@church.kr</span>
          </div>
        </div>
        <button type="button" className={styles.toggle} onClick={onToggle}>
          <span className={styles.toggle_icon}>
            {collapsed ? <HiChevronRight /> : <HiChevronLeft />}
          </span>
          <span className={styles.toggle_label}>접기</span>
        </button>
      </div>
    </aside>
  );
}
