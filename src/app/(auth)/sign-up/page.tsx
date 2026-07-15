import { Metadata } from 'next';
import { Suspense } from 'react';
import SignUpWizard from './_component/SignUpWizard';

export const metadata: Metadata = {
  title: '회원가입 - 대구동남교회',
  description: '대구동남교회 회원가입 페이지입니다. 소셜 로그인 및 이메일로 가입하실 수 있습니다.'
};

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpWizard />
    </Suspense>
  );
}
