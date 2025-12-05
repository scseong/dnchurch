import { CloudinaryUploadResponse } from '@/shared/types/cloudinary';

export async function uploadImage(file: File) {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', `${process.env.NEXT_PUBLIC_CLOUDINARY_PROJECT}`);

  const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}`, {
    method: 'POST',
    body: data
  });

  if (!res.ok) throw new Error('Cloudinary upload failed');

  const result: CloudinaryUploadResponse = await res.json();
  return result;
}
