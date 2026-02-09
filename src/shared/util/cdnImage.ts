type CloudinaryImg = {
  width: number;
  height: number;
  src: string;
  format?: string;
};

export function changeImgFormat({ src, format }: Partial<CloudinaryImg>) {
  return src?.replace(/\.[^/.]+$/, `.${format}`);
}

export function getCloudinaryImgUrl({ width, height, src }: CloudinaryImg) {
  return src.replace('upload/', `upload/w_${width},h_${height},q_auto,f_auto/`);
}
