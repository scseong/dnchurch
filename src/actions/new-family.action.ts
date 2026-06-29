'use server';

import { createServerSideClient } from '@/lib/supabase/server';
import { newFamilyService } from '@/services/new-family/new-family-service';

export type NewFamilyInput = {
  name: string;
  phone: string;
  birthDate?: string;
  referralSource?: string;
  isNewBeliever: boolean;
  interests: string[];
  privacyAgreed: boolean;
};

type SubmitResult = { ok: boolean; error: string | null };

export async function submitNewFamilyRegistration(input: NewFamilyInput): Promise<SubmitResult> {
  const name = input.name?.trim();
  const phone = input.phone?.trim();

  if (!name || !phone) {
    return { ok: false, error: '이름과 연락처를 입력해 주세요.' };
  }
  if (!input.privacyAgreed) {
    return { ok: false, error: '개인정보 수집·이용에 동의해 주세요.' };
  }

  const supabase = await createServerSideClient();
  const { error } = await newFamilyService(supabase).create({
    name,
    phone,
    birth_date: input.birthDate?.trim() || null,
    referral_source: input.referralSource?.trim() || null,
    is_new_believer: input.isNewBeliever,
    interests: input.interests,
    privacy_agreed: input.privacyAgreed
  });

  if (error) {
    console.error('[new-family] 등록 저장 실패', error);
    return { ok: false, error: '등록에 실패했습니다. 잠시 후 다시 시도해 주세요.' };
  }

  return { ok: true, error: null };
}
