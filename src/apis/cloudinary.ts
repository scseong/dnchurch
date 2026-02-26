'use server';

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryUploadResponse } from '@/types/cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_PROJECT,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadImage({ file, folder = '' }: { file: File; folder?: string }) {
  try {
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', `${process.env.NEXT_PUBLIC_CLOUDINARY_PROJECT}`);
    data.append('folder', folder);

    const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}/upload`, {
      method: 'POST',
      body: data
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || 'Cloudinary upload failed');
    }

    return (await res.json()) as CloudinaryUploadResponse;
  } catch (error) {
    console.error(`[Upload Error] ${file.name}:`, error);
    throw error;
  }
}

export async function deleteImage(publicId: string) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error: any) {
    console.error('Cloudinary Delete Error:', error.response?.data || error.message);
    throw error;
  }
}
