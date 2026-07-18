'use client';

import { useEffect } from 'react';
import { LuChevronRight } from 'react-icons/lu';
import { BottomSheet, Button, Label, ListItem } from '@/components/ui';
import { useSettingsSheetStore } from '@/store/settingsSheet.store';
import { useSignOut } from './useSignOut';
import styles from './mypage.module.scss';

const APP_VERSION = '0.7.0'; // package.json version
// BottomSheet 닫힘 애니메이션($transition-duration-normal 0.22s) + useScrollLock의 위치 복원 이후에
// 스크롤해야 계정 섹션으로 이동한 게 복원에 덮이지 않는다.
const SHEET_CLOSE_MS = 240;

// 실제로 구동할 인프라(푸시·스케줄러·번역본 표시)가 없어 준비 중으로 둔다.
const NOTIFY_ITEMS = ['성경 읽기 리마인더', '댓글·나눔 알림', '주간 리포트'];
const GENERAL_ITEMS = ['읽기 알림 시간', '번역본'];

export default function SettingsSheet() {
  const { open, setOpen } = useSettingsSheetStore();
  const { signOut, isSigningOut } = useSignOut();
  const close = () => setOpen(false);

  // /mypage를 벗어나 시트가 unmount되면 store에 열림 상태가 남지 않게 정리한다.
  useEffect(() => () => setOpen(false), [setOpen]);

  const goToAccount = () => {
    close();
    window.setTimeout(() => {
      document
        .getElementById('mypage-account')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, SHEET_CLOSE_MS);
  };

  return (
    <BottomSheet open={open} onClose={close} title="설정">
      <div className={styles.settings}>
        <section className={styles.menu_section} aria-label="알림">
          <h3 className={styles.menu_title}>알림</h3>
          <div className={styles.menu_group}>
            {NOTIFY_ITEMS.map((label) => (
              <ListItem key={label} disabled trailing={<Label variant="neutral">준비 중</Label>}>
                {label}
              </ListItem>
            ))}
          </div>
        </section>

        <section className={styles.menu_section} aria-label="일반">
          <h3 className={styles.menu_title}>일반</h3>
          <div className={styles.menu_group}>
            {GENERAL_ITEMS.map((label) => (
              <ListItem key={label} disabled trailing={<Label variant="neutral">준비 중</Label>}>
                {label}
              </ListItem>
            ))}
          </div>
        </section>

        <section className={styles.menu_section} aria-label="계정">
          <h3 className={styles.menu_title}>계정</h3>
          <div className={styles.menu_group}>
            <ListItem trailing={<LuChevronRight aria-hidden="true" />} onClick={goToAccount}>
              계정 관리
            </ListItem>
            <ListItem disabled trailing={<Label variant="neutral">준비 중</Label>}>
              고객센터
            </ListItem>
            <ListItem className={styles.logout} onClick={signOut} disabled={isSigningOut}>
              로그아웃
            </ListItem>
          </div>
        </section>

        <p className={styles.settings_version}>대구동남교회 앱 버전 {APP_VERSION}</p>

        <Button variant="secondary" fullWidth onClick={close}>
          닫기
        </Button>
      </div>
    </BottomSheet>
  );
}
