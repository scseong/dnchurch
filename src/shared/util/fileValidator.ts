import {
  FILE_BYTES_PER_MB,
  FILE_UPLOAD_MAX_COUNT,
  FILE_UPLOAD_MAX_SIZE_MB
} from '@/shared/constants/file';

export function isFileSizeExceeded(file: File, maxSizeMB = FILE_UPLOAD_MAX_SIZE_MB) {
  return file.size > maxSizeMB * FILE_BYTES_PER_MB;
}

export function isFileCountExceeded(
  existingCount: number,
  newCount: number,
  maxCount = FILE_UPLOAD_MAX_COUNT
) {
  return existingCount + newCount > maxCount;
}

export function isAllowedFileType(file: File, allowedTypes: string[]) {
  const extension = file.name.split('.').pop()?.toLowerCase();

  return allowedTypes.some((type) => {
    if (type === 'image/*') return file.type.startsWith('image/');
    return type.toLowerCase() === extension;
  });
}

export function hasDuplicateFile(existingFiles: File[], file: File) {
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
