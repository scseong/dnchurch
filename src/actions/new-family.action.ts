'use server';

import { createServerSideClient } from '@/lib/supabase/server';
import { newFamilyService } from '@/services/new-family/new-family-service';
import {
  REFERRAL_OPTIONS,
  INTEREST_OPTIONS,
  NEW_FAMILY_LIMITS,
  type ReferralOption,
  type InterestOption
} from '@/constants/new-family';

export type NewFamilyInput = {
  name: string;
  phone: string;
  birthDate?: string;
  referralSource?: string;
  isNewBeliever: boolean;
  interests: string[];
  privacyAgreed: boolean;
  sensitiveAgreed: boolean;
};

type SubmitResult = { success: boolean; message: string };

const BIRTH_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// YYYY-MM-DD 형식이면서 실제 달력상 유효한 날짜인지 — '2026-02-31' 같은 값을 막는다.
function isValidBirthDate(value: string): boolean {
  if (!BIRTH_DATE_REGEX.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

// 공개 anon 경로라 클라이언트 값을 신뢰하지 않는다 — input을 unknown으로 받아 서버에서 다시 검증한다.
export async function submitNewFamilyRegistration(input: unknown): Promise<SubmitResult> {
  if (!input || typeof input !== 'object') {
    return { success: false, message: '입력값을 확인해 주세요.' };
  }

  const raw = input as Partial<NewFamilyInput>;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  const phone = typeof raw.phone === 'string' ? raw.phone.trim() : '';
  const birthDate = typeof raw.birthDate === 'string' ? raw.birthDate.trim() : '';
  const referralSource = typeof raw.referralSource === 'string' ? raw.referralSource.trim() : '';
  const isNewBeliever = raw.isNewBeliever === true;
  const rawInterests = Array.isArray(raw.interests) ? raw.interests : [];
  const privacyAgreed = raw.privacyAgreed === true;
  const sensitiveAgreed = raw.sensitiveAgreed === true;

  if (!name || name.length > NEW_FAMILY_LIMITS.nameMax) {
    return { success: false, message: '이름을 확인해 주세요.' };
  }
  if (phone.length < NEW_FAMILY_LIMITS.phoneMin || phone.length > NEW_FAMILY_LIMITS.phoneMax) {
    return { success: false, message: '연락처를 확인해 주세요.' };
  }
  if (!privacyAgreed) {
    return { success: false, message: '개인정보 수집·이용에 동의해 주세요.' };
  }
  if (birthDate && !isValidBirthDate(birthDate)) {
    return { success: false, message: '생년월일 형식을 확인해 주세요.' };
  }
  if (referralSource && !REFERRAL_OPTIONS.includes(referralSource as ReferralOption)) {
    return { success: false, message: '유입 경로를 확인해 주세요.' };
  }

  // 중복 제거 후 허용값만 남긴다 — 목록 밖 값이 섞였거나 개수를 넘으면 거부한다.
  const uniqueInterests = [...new Set(rawInterests)];
  const interests = uniqueInterests.filter((item): item is InterestOption =>
    INTEREST_OPTIONS.includes(item as InterestOption)
  );
  if (interests.length !== uniqueInterests.length || interests.length > NEW_FAMILY_LIMITS.interestsMax) {
    return { success: false, message: '관심 영역을 확인해 주세요.' };
  }

  // 민감 항목(초신자 여부·관심 영역)은 별도 동의가 있어야 수집한다.
  if ((isNewBeliever || interests.length > 0) && !sensitiveAgreed) {
    return { success: false, message: '민감정보 수집·이용에 동의해 주세요.' };
  }

  try {
    const supabase = await createServerSideClient();
    const { error } = await newFamilyService(supabase).create({
      name,
      phone,
      birth_date: birthDate || null,
      referral_source: referralSource || null,
      is_new_believer: isNewBeliever,
      interests,
      privacy_agreed: privacyAgreed,
      sensitive_agreed: sensitiveAgreed
    });

    if (error) {
      console.error('[new-family] 등록 저장 실패', error);
      return { success: false, message: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.' };
    }
  } catch (err) {
    console.error('[new-family] 예외 발생', err);
    return { success: false, message: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.' };
  }

  return { success: true, message: '새가족 등록 신청이 접수되었습니다.' };
}
