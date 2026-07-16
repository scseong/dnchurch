import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getMySessionProfile } from '@/services/user';
import MainContainer from '@/components/layout/container/MainContainer';
import ProfileSection from './_component/ProfileSection';
import AccountMenu from './_component/AccountMenu';
import styles from './_component/mypage.module.scss';

export const metadata: Metadata = {
  title: '마이 페이지'
};

export default async function Mypage() {
  // 미들웨어가 1차로 막지만, 직접 렌더 경로 방어로 한 번 더 확인한다
  const sessionProfile = await getMySessionProfile();
  if (!sessionProfile) {
    redirect('/login?redirect=/mypage');
  }

  const { user, profile } = sessionProfile;
  // 카카오 전용 계정은 확인할 현재 비밀번호가 없으므로 비밀번호 변경 메뉴를 숨긴다
  const providers = (user.app_metadata?.providers as string[] | undefined) ?? [];
  const hasPasswordAuth = providers.includes('email') || user.app_metadata?.provider === 'email';

  return (
    <MainContainer title="마이 페이지">
      <div className={styles.page}>
        <ProfileSection profile={profile} />
        <AccountMenu hasPasswordAuth={hasPasswordAuth} />
      </div>
    </MainContainer>
  );
}
