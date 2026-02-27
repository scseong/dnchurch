import { getCloudinaryDownloadUrl } from '@/utils/cloudinary';
import {
  FILE_BYTES_PER_MB,
  FILE_UPLOAD_MAX_COUNT,
  FILE_UPLOAD_MAX_SIZE_MB
} from '@/constants/file';

// ---- 파일 정보 ----
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

// ---- 파일 검증 ----
function isFileSizeExceeded(file: File, maxSizeMB = FILE_UPLOAD_MAX_SIZE_MB) {
  return file.size > maxSizeMB * FILE_BYTES_PER_MB;
}

function isFileCountExceeded(
  existingCount: number,
  newCount: number,
  maxCount = FILE_UPLOAD_MAX_COUNT
) {
  return existingCount + newCount > maxCount;
}

function isAllowedFileType(file: File, allowedTypes: string[]) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  return allowedTypes.some((type) => {
    if (type === 'image/*') return file.type.startsWith('image/');
    return type.toLowerCase() === extension;
  });
}

function hasDuplicateFile(existingFiles: File[], file: File) {
  const key = `${file.name}-${file.size}`;
  return existingFiles.some((f) => `${f.name}-${f.size}` === key);
}

export function validateFiles(
  existingFiles: File[],
  newFiles: File[] | FileList,
  allowedTypes: string[] | string
) {
  const newFilesArray = Array.from(newFiles);
  const allowedList = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];
  const validFiles: File[] = [];

  if (isFileCountExceeded(existingFiles.length, newFilesArray.length)) {
    return {
      validFiles: [],
      errorMessage: `최대 ${FILE_UPLOAD_MAX_COUNT}개의 이미지만 업로드 가능합니다.`
    };
  }

  for (const file of newFilesArray) {
    if (hasDuplicateFile(existingFiles, file)) {
      return {
        validFiles: [],
        errorMessage: '이미 업로드된 파일은 다시 첨부할 수 없습니다.'
      };
    }

    if (!isAllowedFileType(file, allowedList)) {
      return {
        validFiles: [],
        errorMessage: `${file.name} 파일은 지원되지 않는 형식입니다.`
      };
    }

    if (isFileSizeExceeded(file)) {
      return {
        validFiles: [],
        errorMessage: `파일이 ${FILE_UPLOAD_MAX_SIZE_MB}MB를 초과합니다.`
      };
    }

    validFiles.push(file);
  }

  return { validFiles };
}
