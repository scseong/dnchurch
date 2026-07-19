'use server';

import { randomUUID } from 'crypto';
import { createServerSideClient } from '@/lib/supabase/server';
import { createAdminServerClient } from '@/lib/supabase/admin';
import { uploadImage, deleteImage } from '@/apis/cloudinary';
import { stripRootPrefix, uploadFolder } from '@/utils/cloudinary';
import type { ActionResult } from './_types';

const DISPLAY_NAME_MAX_LENGTH = 10;
const AVATAR_MAX_SIZE = 5 * 1024 * 1024;
const DISTRICT_ROLES = ['일반', '구역리더', '구역장'];

// 부서·구역 id는 선택 항목 — 빈 값이면 null(선택 안 함). 그 외엔 양의 정수만 허용한다.
// invalid를 null로 조용히 강등하면 조작된 폼이 기존 소속을 지울 수 있어(Codex 1차),
// 유효하지 않으면 ok:false로 알려 액션이 에러를 반환하게 한다.
function parseOptionalId(value: FormDataEntryValue | null): { ok: boolean; value: number | null } {
  const raw = String(value ?? '').trim();
  if (!raw) return { ok: true, value: null };
  const parsed = Number(raw);
  if (Number.isInteger(parsed) && parsed > 0) return { ok: true, value: parsed };
  return { ok: false, value: null };
}

export async function updateProfileAction(formData: FormData): Promise<ActionResult> {
  // 클라이언트 폼 검증은 UX 보조 — 서버에서 항상 다시 검증한다 (ADR 0016)
  const displayName = String(formData.get('displayName') ?? '').trim();
  if (!displayName || displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    return {
      success: false,
      message: `표시 이름은 1~${DISPLAY_NAME_MAX_LENGTH}자로 입력해주세요.`
    };
  }

  const dept = parseOptionalId(formData.get('deptId'));
  const district = parseOptionalId(formData.get('districtId'));
  const roleRaw = String(formData.get('districtRole') ?? '일반');
  if (!dept.ok || !district.ok || !DISTRICT_ROLES.includes(roleRaw)) {
    return { success: false, message: '소속 정보가 올바르지 않습니다.' };
  }
  const deptId = dept.value;
  const districtId = district.value;
  // 구역이 없으면 역할은 일반 — "구역 내 역할"이라 구역 없이 구역장/리더는 성립하지 않는다 (Codex 1차).
  const districtRole = districtId === null ? '일반' : roleRaw;

  const supabase = await createServerSideClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) {
    return { success: false, message: '로그인이 필요합니다.' };
  }

  let avatarId: string | undefined;
  let previousAvatarId: string | null = null;
  const avatarEntry = formData.get('avatar');
  if (avatarEntry instanceof File && avatarEntry.size > 0) {
    if (!avatarEntry.type.startsWith('image/')) {
      return { success: false, message: '이미지 파일만 올릴 수 있습니다.' };
    }
    if (avatarEntry.size > AVATAR_MAX_SIZE) {
      return { success: false, message: '이미지는 5MB 이하만 올릴 수 있습니다.' };
    }

    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single();
    previousAvatarId = currentProfile?.avatar_url ?? null;

    try {
      const uploaded = await uploadImage({
        file: avatarEntry,
        folder: uploadFolder('profiles'),
        // UUID로 재업로드마다 public_id를 바꿔 변환 URL 캐시가 이전 이미지를 물지 않게 한다
        filename: `${user.id}-${randomUUID().slice(0, 8)}`
      });
      avatarId = stripRootPrefix(uploaded.public_id);
    } catch {
      return { success: false, message: '이미지 업로드에 실패했습니다. 잠시 후 다시 시도해주세요.' };
    }
  }

  // profiles는 클라이언트 쓰기가 잠겨 있어(UPDATE GRANT 회수, 20260611000000 마이그레이션)
  // 본인 확인 후 admin 클라이언트로 갱신한다. admin은 RLS를 우회하므로
  // payload는 허용 2컬럼 상수 literal만 쓴다 — 입력 객체 spread 금지 (exec-plan D1)
  const payload = avatarId
    ? {
        display_name: displayName,
        avatar_url: avatarId,
        dept_id: deptId,
        district_id: districtId,
        district_role: districtRole
      }
    : {
        display_name: displayName,
        dept_id: deptId,
        district_id: districtId,
        district_role: districtRole
      };

  const admin = createAdminServerClient();
  const { error } = await admin.from('profiles').update(payload).eq('id', user.id);
  if (error) {
    if (avatarId) {
      await deleteImage(avatarId).catch(() => {});
    }
    return { success: false, message: '프로필 저장에 실패했습니다. 잠시 후 다시 시도해주세요.' };
  }

  // 교체된 이전 아바타는 orphan으로 남기지 않는다. 외부 URL(카카오 프로필 등)은 삭제 대상이 아니다.
  if (avatarId && previousAvatarId && !/^https?:\/\//i.test(previousAvatarId)) {
    await deleteImage(previousAvatarId).catch(() => {});
  }

  return { success: true, message: '프로필을 저장했습니다.' };
}
