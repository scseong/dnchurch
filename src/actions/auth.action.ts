'use server';

import { cookies } from 'next/headers';
import { createServerSideClient } from '@/lib/supabase/server';
import { generateErrorMessage } from '@/utils/error';
import { EMAIL_REGEX, PASSWORD_REGEX, NAME_REGEX } from '@/constants/regex';
import { RESET_AUTH_CODE_KEY, RESET_USER_ID_KEY } from '@/constants/auth';
import type { ActionResult } from './_types';

type SignUpInput = {
  email: string;
  password: string;
  name: string;
  username: string;
  /** 선택 연락처. 인증하지 않고 profiles.phone에 저장 (handle_new_user 트리거 경유). */
  phone?: string;
  /** 이메일 인증 링크 클릭 후 착지할 사이트 내 경로. */
  redirectTo?: string;
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

export async function verifyPasswordResetOtpAction(
  email: string,
  token: string
): Promise<ActionResult> {
  if (!EMAIL_REGEX.test(email)) {
    return { success: false, message: '올바른 이메일 형식이 아닙니다.' };
  }

  const code = token.trim();
  if (!/^\d{6}$/.test(code)) {
    return { success: false, message: '6자리 인증 코드를 입력해주세요.' };
  }

  const supabase = await createServerSideClient();
  const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'recovery' });

  if (error) {
    return { success: false, message: '인증 코드가 올바르지 않거나 만료되었습니다.' };
  }

  // 직전 매직링크 시도가 남긴 쿠키가 재설정 화면의 no-cookie 분기를 가로채지 않게 지운다
  const cookieStore = await cookies();
  cookieStore.delete(RESET_AUTH_CODE_KEY);
  cookieStore.delete(RESET_USER_ID_KEY);

  return { success: true, message: '인증되었습니다.' };
}

export async function signUpAction({
  email,
  password,
  name,
  username,
  phone,
  redirectTo = '/'
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

  // env가 비면 확인 메일 링크가 'undefined/auth/...'로 나간다 — 보내기 전에 막는다
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    return { success: false, message: '서버 설정 오류로 가입을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.' };
  }

  const trimmedPhone = phone?.trim();

  const supabase = await createServerSideClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // token_hash 검증 라우트로 보낸다 — code 교환은 가입 브라우저에만 있는 code_verifier가 필요해 다른 기기에서 확인이 깨진다
      emailRedirectTo: `${siteUrl}/auth/confirm?next=${encodeURIComponent(redirectTo)}`,
      // phone_number는 handle_new_user 트리거가 profiles.phone에 저장한다. 빈 값은 넣지 않는다
      data: trimmedPhone ? { name, phone_number: trimmedPhone } : { name }
    }
  });

  if (error) {
    return { success: false, message: generateErrorMessage(error) };
  }

  return {
    success: true,
    message: '인증 메일을 보냈습니다.',
    data: { hasSession: Boolean(data.session) }
  };
}
