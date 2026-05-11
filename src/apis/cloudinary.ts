'use server';

import { v2 as cloudinary } from 'cloudinary';

const ROOT_FOLDER = process.env.NEXT_PUBLIC_CLOUDINARY_ROOT_FOLDER ?? '';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary destroy는 fully-qualified public_id를 요구. DB에 저장된 ROOT-relative cloudinary_id를 받으면 ROOT 합성
function toFullyQualifiedPublicId(publicId: string): string {
  if (/^https?:\/\//i.test(publicId)) return publicId;
  const trimmed = publicId.replace(/^\/+/, '');
  if (!ROOT_FOLDER) return trimmed;
  const prefix = `${ROOT_FOLDER}/`;
  return trimmed.startsWith(prefix) ? trimmed : `${prefix}${trimmed}`;
}

export async function uploadImage({
  file,
  folder,
  filename
}: {
  file: File;
  folder: string;
  filename: string;
}) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder,
      public_id: `${folder}/${filename}`
    });

    return result;
  } catch (error) {
    console.error(`[Cloudinary Upload Error] ${file.name}:`, error);
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(toFullyQualifiedPublicId(publicId));
    return result;
  } catch (error: any) {
    console.error('[Cloudinary Delete Error] ', {
      publicId,
      error: error.response?.data || error.message
    });
    throw error;
  }
}
