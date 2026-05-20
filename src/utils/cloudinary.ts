import { ImageLoaderProps } from 'next/image';

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const ROOT_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER ?? '';
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

// ROOT prefix missing from public_id is composed here; full URL passthrough belongs to URL builders.
const normalizePublicId = (input: string): string => {
  const trimmed = input.replace(/^\/+/, '');
  if (!ROOT_FOLDER) return trimmed;
  const prefix = `${ROOT_FOLDER}/`;
  return trimmed.startsWith(prefix) ? trimmed : `${prefix}${trimmed}`;
};

const assertSegment = (segment: string, label: string) => {
  if (!segment) throw new Error(`${label}: segment cannot be empty`);
  if (segment.includes('/')) throw new Error(`${label}: segment "${segment}" cannot contain "/"`);
};

// Cloudinary 업로드 응답의 public_id에서 환경 prefix를 떼서 DB에 저장할 때 사용
export const stripRootPrefix = (publicId: string): string => {
  const cleaned = publicId.replace(/^\/+/, '');
  if (!ROOT_FOLDER) return cleaned;
  const prefix = `${ROOT_FOLDER}/`;
  return cleaned.startsWith(prefix) ? cleaned.slice(prefix.length) : cleaned;
};

// 정적 자산(코드에서 직접 참조하는 사이트 이미지)의 public_id 합성: <CloudinaryImage src={siteAsset('home/sketch')} />
export const siteAsset = (relativePath: string): string => {
  const cleaned = relativePath.replace(/^\/+|\/+$/g, '');
  if (!cleaned) throw new Error('siteAsset: relativePath cannot be empty');
  if (cleaned.includes('//')) throw new Error('siteAsset: relativePath cannot contain "//"');
  return ROOT_FOLDER ? `${ROOT_FOLDER}/site/${cleaned}` : `site/${cleaned}`;
};

// 동적 업로드(주보·설교 등 DB 첨부 자산)의 업로드 folder path 합성: uploadFolder('bulletins', '2026', '03', '28')
export const uploadFolder = (domain: string, ...parts: string[]): string => {
  assertSegment(domain, 'uploadFolder');
  parts.forEach((part) => assertSegment(part, 'uploadFolder'));
  const tail = [domain, ...parts].join('/');
  return ROOT_FOLDER ? `${ROOT_FOLDER}/uploads/${tail}` : `uploads/${tail}`;
};

// Cloudinary 전송 URL 빌더 — <img>·OG 메타데이터·다운로드 등 <Image> 컴포넌트 외 사용처
export const getCloudinaryUrl = (publicId: string) =>
  /^https?:\/\//i.test(publicId) ? publicId : `${BASE_URL}/${normalizePublicId(publicId)}`;

export const getCloudinaryDownloadUrl = (publicId: string) =>
  `${BASE_URL}/fl_attachment/${normalizePublicId(publicId)}`;

// 외부 호스트(YouTube 썸네일 등)를 Cloudinary fetch URL로 감싸 next/image의 res.cloudinary.com remotePattern을 통과시키는 helper.
// public ID(http(s):// 미접두) 입력은 fetch가 아니라 image/upload 변환 대상이므로 그대로 반환 — 호출부에서 <CloudinaryImage> loader가 처리.
export const cloudinaryFetchUrl = (remoteUrl: string | null): string | null => {
  if (remoteUrl === null) return null;
  if (!/^https?:\/\//i.test(remoteUrl)) return remoteUrl;
  if (/^https:\/\/res\.cloudinary\.com\//i.test(remoteUrl)) return remoteUrl;
  if (!CLOUD_NAME) return null;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/fetch/f_auto,q_auto/${encodeURIComponent(remoteUrl)}`;
};

export type CropMode = 'fill' | 'crop' | 'thumb' | 'scale' | 'fit' | 'limit' | 'pad' | 'auto';
export type CropGravity = 'auto' | 'face' | 'faces' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west';

type CloudinaryLoaderOptions = {
  cropMode?: CropMode;
  gravity?: CropGravity;
  aspectRatio?: string;
};

// next/image의 loader — <CloudinaryImage>가 내부적으로 사용. src에 ROOT가 없으면 자동 합성됨
export function createCloudinaryLoader({ cropMode, gravity, aspectRatio }: CloudinaryLoaderOptions = {}) {
  return function ({ src, width, quality }: ImageLoaderProps) {
    // Cloudinary fetch URL(YouTube 썸네일 등 외부 호스트 래핑)은 변환 세그먼트를 width 반응형으로 치환.
    // cloudinaryFetchUrl이 구운 f_auto,q_auto는 유지하고 c_limit,w_<width>만 더한다 (q_ 중복 방지, 업스케일 차단).
    const fetchMatch = src.match(
      /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/fetch\/)[^/]+\/(.+)$/i
    );
    if (fetchMatch) {
      return `${fetchMatch[1]}f_auto,q_auto,c_limit,w_${width}/${fetchMatch[2]}`;
    }
    if (/^https?:\/\//i.test(src)) return src;
    const params = ['f_auto'];
    if (cropMode) {
      params.push(`c_${cropMode}`);
      if (gravity) params.push(`g_${gravity}`);
      if (aspectRatio) params.push(`ar_${aspectRatio}`);
    } else {
      params.push('c_limit');
    }
    params.push(`w_${width}`, `q_${quality || 85}`);
    return `${BASE_URL}/${params.join(',')}/${normalizePublicId(src)}`;
  };
}

export default createCloudinaryLoader();
