'use client';

import { ReactNode } from 'react';
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
import styles from './index.module.scss';

interface SidebarItem {
  label: string;
  icon: ReactNode;
  active?: boolean;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const SECTIONS: SidebarSection[] = [
  {
    title: '메인',
    items: [{ label: '대시보드', icon: <HiOutlineHome /> }]
  },
  {
    title: '설교',
    items: [
      { label: '설교 관리', icon: <HiOutlinePlay />, active: true, badge: '128' },
      { label: '시리즈 관리', icon: <HiOutlineFolder />, badge: '24' },
      { label: '설교자 관리', icon: <HiOutlineUser /> }
    ]
  },
  {
    title: '멤버',
    items: [{ label: '멤버 관리', icon: <HiOutlineUsers /> }]
  },
  {
    title: '시스템',
    items: [{ label: '설정', icon: <HiOutlineCog /> }]
  }
];

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
        {SECTIONS.map((section) => (
          <div key={section.title} className={styles.section}>
            <h3 className={styles.section_title}>{section.title}</h3>
            <ul className={styles.items}>
              {section.items.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    className={clsx(styles.item, item.active && styles.on)}
                    onClick={onMobileClose}
                  >
                    <span className={styles.icon}>{item.icon}</span>
                    <span className={styles.label}>{item.label}</span>
                    {item.badge && <span className={styles.badge}>{item.badge}</span>}
                  </button>
                </li>
              ))}
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
