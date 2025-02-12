import { UploadFileApiResponse } from '@/actions/file.action';
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

export function getUrlsFromApiResponse(response: UploadFileApiResponse[]) {
  return response
    .map((result) => result.data?.url)
    .filter((url): url is string => url !== undefined);
}
