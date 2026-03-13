import { BulletinImageType, BulletinType } from '@/types/common';

export type BulletinWithImages = BulletinType & {
  bulletin_images: BulletinImageType[];
  profiles?: { display_name: string | null } | null;
};

export type BulletinParams = { year?: number; page?: number; limit?: number };

export type BulletinImageInput = {
  cloudinaryId: string;
  url: string;
  orderIndex: number;
};

export type BulletinFormParams = {
  title: string;
  sundayDate: string;
  images: BulletinImageInput[];
  authorId: string;
};

export type BulletinEditFormParams = {
  bulletinId: string;
  title?: string;
  sundayDate?: string;
  imagesToAdd?: BulletinImageInput[];
  imageIdsToDelete?: number[];
};

export type BulletinSummaryResponse = {
  latest: BulletinWithImages | null;
  years: number[];
  items: BulletinWithImages[];
  total: number;
};

export type ExistingImageItem = {
  type: 'existing';
  id: string;
  imageId: number;
  cloudinaryId: string;
  url: string;
  orderIndex: number;
};

export type NewFileItem = {
  type: 'new';
  file: File;
  previewUrl: string;
  id: string;
};

export type ImageItem = ExistingImageItem | NewFileItem;

export type BulletinFormInputs = {
  title: string;
  sundayDate: string;
  images: ImageItem[];
};

export type BulletinFormProps = {
  mode: 'create' | 'edit';
  bulletinId?: string;
  initialData?: {
    title: string;
    sundayDate: string;
    images?: ExistingImageItem[];
    authorId: string;
  };
};
