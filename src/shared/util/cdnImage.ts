type CloudinaryImg = {
  width: number;
  height: number;
  src: string;
  format?: string;
};

export function changeImgFormat({ src, format }: Partial<CloudinaryImg>) {
  return src?.replace(/\.[^/.]+$/, `.${format}`);
}

type CloudinaryTransform = {
  src: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale';
  format?: 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
  quality?: 'auto' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
};

export function getCloudinaryImgUrl({
  src,
  width,
  height,
  crop = 'fill',
  format = 'auto',
  quality = 'auto'
}: CloudinaryTransform) {
  if (!src.includes('/upload/')) return src;

  const transforms = [
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
    `q_${quality}`,
    `f_${format}`
  ]
    .filter(Boolean)
    .join(',');

  return src.replace('/upload/', `/upload/${transforms}/`);
}
