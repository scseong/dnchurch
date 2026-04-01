import { isNumeric } from '@/utils/validator';

export const validate = {
  number: (v?: string) => v === undefined || isNumeric(v),
  boolean: (v?: string) => v === undefined || v === 'true' || v === 'false',
  within:
    <T extends Record<string, string>>(allowed: T) =>
    (v?: string) =>
      v === undefined || Object.keys(allowed).includes(v)
};

export function validateSearchParams(
  searchParams: Record<string, string | undefined>,
  schema: Record<string, (v?: string) => boolean>
) {
  const isValid = Object.entries(schema).every(([key, validator]) => validator(searchParams[key]));
  return isValid;
}
