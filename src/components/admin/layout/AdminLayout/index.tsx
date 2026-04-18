'use client';

import { PropsWithChildren, useState } from 'react';
import clsx from 'clsx';
import AdminHeader from '../AdminHeader';
import AdminSidebar from '../AdminSidebar';
import styles from './index.module.scss';

export default function AdminLayout({ children }: PropsWithChildren) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className={styles.shell}>
      <AdminSidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((value) => !value)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div
        className={clsx(styles.overlay, mobileSidebarOpen && styles.open)}
        onClick={() => setMobileSidebarOpen(false)}
        aria-hidden
      />
      <div className={styles.main_area}>
        <AdminHeader
          crumbs={['관리자', '대시보드']}
          onMobileMenuClick={() => setMobileSidebarOpen(true)}
        />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
