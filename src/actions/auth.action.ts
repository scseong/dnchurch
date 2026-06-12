'use server';

import { createServerSideClient } from '@/lib/supabase/server';
import { generateErrorMessage } from '@/utils/error';
import { EMAIL_REGEX, PASSWORD_REGEX, NAME_REGEX } from '@/constants/regex';
import type { ActionResult } from './_types';

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  username: string;
};

type SignUpData = {
  /** 가입 직후 세션 생성 여부 — 이메일 확인이 필요한 설정이면 false */
  hasSession: boolean;
};

export async function requestPasswordResetEmailAction(email: string): Promise<ActionResult> {
  // 클라이언트 폼 검증은 UX 보조 — 서버에서 항상 다시 검증한다 (ADR 0016)
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, message: '올바른 이메일 형식이 아닙니다.' };
  }

  // env가 비면 'undefined/auth/...' 링크가 담긴 메일이 나간다 — 보내기 전에 막는다 (Codex 1차 지적)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return { success: false, message: '서버 설정 오류로 메일을 보낼 수 없습니다. 잠시 후 다시 시도해주세요.' };
  }

  const supabase = await createServerSideClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/auth/reset-password`
  });

  if (error) {
    return { success: false, message: generateErrorMessage(error) };
  }

  return { success: true, message: '인증 메일을 보냈습니다.' };
}

export async function signUpAction({
  email,
  password,
  name,
  username
}: SignUpInput): Promise<ActionResult<SignUpData>> {
  // 클라이언트 폼 검증은 UX 보조 — 서버에서 항상 다시 검증한다 (ADR 0016)
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, message: '올바른 이메일 형식이 아닙니다.' };
  }
  if (!PASSWORD_REGEX.test(password)) {
    return { success: false, message: '비밀번호는 영문, 숫자 포함 8자 이상이여야 합니다.' };
  }
  if (!NAME_REGEX.test(name)) {
    return { success: false, message: '한글 또는 영문으로만 입력해주세요.' };
  }
  if (!username || username.length > 10) {
    return { success: false, message: '프로필 이름은 10자 이내로 입력해주세요.' };
  }

  const supabase = await createServerSideClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error) {
    return { success: false, message: generateErrorMessage(error) };
  }

  return {
    success: true,
    message: '가입이 완료되었습니다.',
    data: { hasSession: Boolean(data.session) }
  };
}
