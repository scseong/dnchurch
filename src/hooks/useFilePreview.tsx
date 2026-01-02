import { ImageFile } from '@/shared/types/types';
import { useEffect, useState } from 'react';

export default function useFilePreview(files: File[]) {
  const [images, setImages] = useState<ImageFile[]>([]);

  useEffect(() => {
    const newPreviews = files.map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));

    setImages((prev) => {
      prev.forEach((img) => {
        const exists = files.some((f) => f.name === img.file.name && f.size === img.file.size);
        if (!exists) URL.revokeObjectURL(img.previewUrl);
      });
      return newPreviews;
    });

    return () => {
      newPreviews.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [files]);

  return images;
}
