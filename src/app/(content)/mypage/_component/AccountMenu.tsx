'use client';

import { useState } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { Label, ListItem } from '@/components/ui';
import { useToastStore } from '@/store/toast.store';
import PasswordChangeModal from './PasswordChangeModal';
import SettingsSheet from './SettingsSheet';
import { useSignOut } from './useSignOut';
import styles from './mypage.module.scss';

const PLANNED_MENUS = ['저장한 설교', '나의 기도제목', '출석 현황'];

export default function AccountMenu({ hasPasswordAuth }: { hasPasswordAuth: boolean }) {
  const { info } = useToastStore();
  const [passwordOpen, setPasswordOpen] = useState(false);
  const { signOut, isSigningOut } = useSignOut();

  return (
    <>
      <section className={styles.menu_section} aria-label="내 활동">
        <h3 className={styles.menu_title}>내 활동</h3>
        <div className={styles.menu_group}>
          {PLANNED_MENUS.map((menu) => (
            <ListItem
              key={menu}
              trailing={<Label variant="neutral">준비 중</Label>}
              onClick={() => info('준비 중인 기능이에요.')}
            >
              {menu}
            </ListItem>
          ))}
        </div>
      </section>

      <section id="mypage-account" className={styles.menu_section} aria-label="계정">
        <h3 className={styles.menu_title}>계정</h3>
        <div className={styles.menu_group}>
          {hasPasswordAuth && (
            <ListItem
              trailing={<LuChevronRight aria-hidden="true" />}
              onClick={() => setPasswordOpen(true)}
            >
              비밀번호 변경
            </ListItem>
          )}
          <ListItem className={styles.logout} onClick={signOut} disabled={isSigningOut}>
            로그아웃
          </ListItem>
        </div>
      </section>

      <PasswordChangeModal open={passwordOpen} onClose={() => setPasswordOpen(false)} />
      <SettingsSheet />
    </>
  );
}
