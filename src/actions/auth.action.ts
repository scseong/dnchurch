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
