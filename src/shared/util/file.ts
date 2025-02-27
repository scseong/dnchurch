import { UploadFileApiResponse } from '@/actions/file.action';
import { parseDateFromString } from './date';
import type { ImageFileData } from '@/shared/types/types';

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

export function convertBytesToFileSize(totalBytes: number, decimals = 2) {
  if (totalBytes === 0) return '0 Bytes';
  const KILOBYTE = 1024;
  const SIZEUNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const idx = Math.floor(Math.log(totalBytes) / Math.log(KILOBYTE));
  const sizeValue = parseFloat((totalBytes / Math.pow(KILOBYTE, idx)).toFixed(decimals));

  return `${sizeValue} ${SIZEUNITS[idx]}`;
}

export function convertFileToImageData(file: File): Promise<ImageFileData> {
  return new Promise<ImageFileData>((resolve) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve({
        id: Date.now(),
        filename: file.name,
        filetype: file.type,
        fileimage: reader.result,
        filesize: convertBytesToFileSize(file.size),
        datetime: new Date(file.lastModified).toLocaleString('ko-KR')
      });
    };

    reader.readAsDataURL(file);
  });
}
