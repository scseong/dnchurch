'use server';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
      public_id: filename
    });

    return result;
  } catch (error) {
    console.error(`[Cloudinary Upload Error] ${file.name}:`, error);
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error: any) {
    console.error('[Cloudinary Delete Error] ', error.response?.data || error.message);
    throw error;
  }
}
