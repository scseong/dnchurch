export type CloudinaryUploadResponse = {
  asset_id: string;
  public_id: string;
  version: number;
  version_id: string;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  asset_folder: string;
  display_name: string;
  original_filename: string;
};

export type ImageQuality = 'auto' | 'auto:eco' | 'auto:good' | 'auto:best' | number;
export type ImageFormat = 'auto' | 'webp' | 'avif' | 'png' | 'jpg';
export type ImageCrop = 'fill' | 'fit' | 'scale';

export type CloudinaryImageProps = {
  src: string;
  alt: string;
  width: number;
  sizes: string;
  srcsetWidths: number[];
  quality?: ImageQuality;
  crop?: ImageCrop;
  priority?: boolean;
  className?: string;
  style?: React.CSSProperties;
};
