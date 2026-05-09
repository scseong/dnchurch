// site_settings.value가 'TODO' 또는 'TODO:' prefix·undefined·빈 문자열일 때 fallback 표시.
// admin 입력 전 placeholder 노출 정책 (ADR 0006).

export const displaySettingValue = (
  value: string | null | undefined,
  fallback = '준비 중'
): string => {
  if (!value) return fallback;
  if (value === 'TODO' || value.startsWith('TODO:')) return fallback;
  return value;
};

// site_settings의 위경도 같은 수치 값이 빈 문자열·'TODO'·NaN일 때 fallback 적용.
export const parseFiniteFloat = (
  value: string | null | undefined,
  fallback: number
): number => {
  const parsed = parseFloat(value ?? '');
  return Number.isFinite(parsed) ? parsed : fallback;
};
