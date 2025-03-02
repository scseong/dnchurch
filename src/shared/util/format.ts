export function extractNumbersFromString(str: string) {
  const result = str.match(/\d+/g);
  return result ? result.join('') : '';
}
