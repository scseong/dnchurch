import { CloudinaryUploadResponse } from '@/shared/types/cloudinary';

type Props = {
  file: File;
  folder: string;
};

export async function uploadImage({ file, folder = '' }: Props) {
  const data = new FormData();
  data.append('file', file);
  data.append('upload_preset', `${process.env.NEXT_PUBLIC_CLOUDINARY_PROJECT}`);
  data.append('folder', folder);

  const res = await fetch(`${process.env.NEXT_PUBLIC_CLOUDINARY_URL}`, {
    method: 'POST',
    body: data
  });

  if (!res.ok) throw new Error('Cloudinary upload failed');

  const result: CloudinaryUploadResponse = await res.json();
  return result;
}
