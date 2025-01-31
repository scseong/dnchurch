export function parseDateFromString(fileName: string) {
  return fileName.match(/\d+/g)?.join('');
}
