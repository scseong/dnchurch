import { parseDateFromString } from './date';

export function getFileExtension(fileName: string): string {
  const lastDotIndex = fileName.lastIndexOf('.');
  return fileName.substring(lastDotIndex + 1);
}

export function generateFileName(fileName: string) {
  const date = parseDateFromString(fileName);
  const extension = getFileExtension(fileName);

  if (date && extension) return `${date}.${extension}`;

  return null;
}
