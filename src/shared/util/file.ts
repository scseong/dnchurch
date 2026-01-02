import { UploadFileApiResponse } from '@/actions/file.action';
import type { ImageFileData } from '@/shared/types/types';

export function getFilenameFromUrl(url: string) {
  const rawFileName = url.split('/').pop() || '';
  return decodeURIComponent(rawFileName).split(/[?#]/)[0];
}

export function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
}

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
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

/**
 * @deprecated
 */
export const convertUrlToImageData = async (url: string) => {
  const res = await fetch(url);
  const data = await res.blob();
  const lastModified = res.headers.get('last-modified')!;
  const file = new File([data], getFilenameFromUrl(url), {
    type: data.type,
    lastModified: new Date(lastModified).getTime()
  });

  return convertFileToImageData(file);
};

/**
 * @deprecated
 */
function base64ToBytes(base64: string) {
  const binString = atob(base64);
  return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
}

/**
 * @deprecated
 */
function bytesToBase64(bytes: Uint8Array) {
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('');
  return btoa(binString);
}

/**
 * @deprecated
 */
export function convertFileNameToBase64(name: string) {
  return bytesToBase64(new TextEncoder().encode(name));
}

/**
 * @deprecated
 */
export function convertBase64ToFileName(encoded: string) {
  return new TextDecoder().decode(base64ToBytes(encoded));
}

export function generateFileDownloadList({ urls }: { urls: string[] }) {
  return urls.map((url, index) => {
    const fullFilename = decodeURIComponent(url.split('/').pop() || `file_${index + 1}`);
    const extension = getFileExtension(fullFilename);
    const nameWithoutExt = fullFilename.replace(extension, '');

    const nameParts = nameWithoutExt.split('_');
    const originalName = nameParts.length > 1 ? nameParts.slice(0, -1).join('_') : nameWithoutExt;

    const downloadUrl = url.replace('/upload/', '/upload/fl_attachment/');

    return {
      filename: `${originalName}${extension}`,
      downloadUrl
    };
  });
}
