import { NUMBER_REGEX } from '@/shared/util/regex';

export const isNumeric = (val: string | string[] | undefined | null) => {
  if (!val) return true;
  if (Array.isArray(val)) return false;
  return NUMBER_REGEX.test(val);
};
