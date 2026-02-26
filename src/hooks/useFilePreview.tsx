import { useEffect, useRef, useState } from 'react';
import { ImageFile } from '@/types/common';

export default function useFilePreview(files: File[]) {
  const [previewImages, setPreviewImages] = useState<ImageFile[]>([]);
  const fileUrlMapRef = useRef<Map<File, string>>(new Map());

  useEffect(() => {
    const nextPreviewImages: ImageFile[] = files.map((file) => {
      if (!fileUrlMapRef.current.has(file)) {
        fileUrlMapRef.current.set(file, URL.createObjectURL(file));
      }

      return { file, previewUrl: fileUrlMapRef.current.get(file)! };
    });

    fileUrlMapRef.current.forEach((url, file) => {
      if (!files.includes(file)) {
        URL.revokeObjectURL(url);
        fileUrlMapRef.current.delete(file);
      }
    });

    setPreviewImages(nextPreviewImages);
  }, [files]);

  useEffect(() => {
    return () => {
      fileUrlMapRef.current.forEach((url) => URL.revokeObjectURL(url));
      fileUrlMapRef.current.clear();
    };
  }, []);

  return previewImages;
}
