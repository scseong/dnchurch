'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IoHomeOutline, IoHome, IoBookOutline, IoBook, IoMenuOutline, IoMenu } from 'react-icons/io5';
import { HiOutlineNewspaper, HiNewspaper } from 'react-icons/hi2';
import { IoPeopleOutline, IoPeople } from 'react-icons/io5';
import clsx from 'clsx';
import Modal from '@/components/common/Modal';
import Drawer from '@/components/layout/header/Drawer';
import { TAB_ITEMS, getActiveTabKey, type TabKey } from '@/constants/app-navigation';
import styles from './BottomTabBar.module.scss';

const TAB_ICONS: Record<TabKey, { outline: React.ReactNode; filled: React.ReactNode }> = {
  home: { outline: <IoHomeOutline />, filled: <IoHome /> },
  sermons: { outline: <IoBookOutline />, filled: <IoBook /> },
  news: { outline: <HiOutlineNewspaper />, filled: <HiNewspaper /> },
  community: { outline: <IoPeopleOutline />, filled: <IoPeople /> },
  menu: { outline: <IoMenuOutline />, filled: <IoMenu /> }
};

export default function BottomTabBar() {
  const pathname = usePathname();
  const activeKey = getActiveTabKey(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <>
      {menuOpen && (
        <Modal isVisible={menuOpen} onClose={() => setMenuOpen(false)}>
          <Drawer isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
        </Modal>
      )}

      <nav className={styles.tab_bar}>
        <ul className={styles.tab_list}>
          {TAB_ITEMS.map((tab) => {
            const isActive = tab.key === 'menu' ? menuOpen : activeKey === tab.key;
            const icons = TAB_ICONS[tab.key];

            return (
              <li key={tab.key}>
                {tab.key === 'menu' ? (
                  <button
                    type="button"
                    className={clsx(styles.tab_item, isActive && styles.active)}
                    onClick={() => setMenuOpen((prev) => !prev)}
                  >
                    <span className={styles.tab_icon}>{isActive ? icons.filled : icons.outline}</span>
                    <span className={styles.tab_label}>{tab.label}</span>
                  </button>
                ) : (
                  <Link
                    href={tab.path}
                    className={clsx(styles.tab_item, isActive && styles.active)}
                    onClick={() => setMenuOpen(false)}
                  >
                    <span className={styles.tab_icon}>{isActive ? icons.filled : icons.outline}</span>
                    <span className={styles.tab_label}>{tab.label}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
