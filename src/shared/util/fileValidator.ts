const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE_MB = 5;
const BYTES_PER_MB = 1024 * 1024;

export function isFileSizeExceeded(file: File, maxSizeMB = MAX_FILE_SIZE_MB): boolean {
  return file.size > maxSizeMB * BYTES_PER_MB;
}

export function validateFiles(
  existingFiles: File[],
  newFiles: File[] | FileList,
  allowedTypes: string[] | string
) {
  const newFilesArray = Array.from(newFiles);
  const validFiles: File[] = [];
  let errorMessage: string | undefined;

  const existingFileKeys = new Set(existingFiles.map((f) => `${f.name}-${f.size}`));
  if (existingFiles.length + newFilesArray.length > MAX_FILE_COUNT) {
    return {
      validFiles: [],
      errorMessage: `최대 ${MAX_FILE_COUNT}개의 이미지만 업로드 가능합니다.`
    };
  }

  const allowedList = Array.isArray(allowedTypes) ? allowedTypes : [allowedTypes];

  for (const file of newFilesArray) {
    const fileKey = `${file.name}-${file.size}`;

    if (existingFileKeys.has(fileKey)) {
      errorMessage = '이미 업로드된 파일은 다시 첨부할 수 없습니다.';
      break;
    }

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isAllowed = allowedList.some((type) => {
      if (type === 'image/*') return file.type.startsWith('image/');
      return type.toLowerCase() === fileExtension;
    });

    if (!isAllowed) {
      errorMessage = `${file.name} 파일은 지원되지 않는 형식입니다.`;
      break;
    }

    if (isFileSizeExceeded(file, MAX_FILE_SIZE_MB)) {
      errorMessage = `파일이 ${MAX_FILE_SIZE_MB}MB를 초과합니다.`;
      break;
    }

    validFiles.push(file);
  }

  return { validFiles, errorMessage };
}
