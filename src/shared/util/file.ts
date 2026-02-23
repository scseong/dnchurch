import { getCloudinaryDownloadUrl } from '@/shared/util/cdnImage';

export function getFilenameFromUrl(url: string) {
  const rawFileName = url.split('/').pop() || '';
  return decodeURIComponent(rawFileName).split(/[?#]/)[0];
}

export function getFileExtension(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf('.');
  return lastDotIndex !== -1 ? fileName.substring(lastDotIndex) : '';
}

export function convertBytesToFileSize(totalBytes: number, decimals = 2) {
  if (totalBytes === 0) return '0 Bytes';
  const KILOBYTE = 1024;
  const SIZEUNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const idx = Math.floor(Math.log(totalBytes) / Math.log(KILOBYTE));
  const sizeValue = parseFloat((totalBytes / Math.pow(KILOBYTE, idx)).toFixed(decimals));

  return `${sizeValue} ${SIZEUNITS[idx]}`;
}

export function generateFileDownloadList({ urls }: { urls: string[] }) {
  return urls.map((publicId, index) => {
    const segment = decodeURIComponent(publicId.split('/').pop() || `file_${index + 1}`);
    const nameWithoutSuffix = segment.replace(/_[^_]+$/, '');

    return {
      filename: nameWithoutSuffix,
      downloadUrl: getCloudinaryDownloadUrl(publicId)
    };
  });
}
