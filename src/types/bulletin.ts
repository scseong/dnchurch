import { BulletinImageType, BulletinType } from '@/types/common';

/** 목록·상세 소비처가 실제 읽는 필드 union — BULLETIN_WITH_IMAGES_SELECT와 1:1 대조 유지 (P5) */
export type BulletinWithImages = Pick<
  BulletinType,
  'id' | 'title' | 'sunday_date' | 'created_at' | 'author_id'
> & {
  bulletin_images: Pick<BulletinImageType, 'id' | 'cloudinary_id' | 'order_index'>[];
};

export type BulletinParams = { year?: number; page?: number; limit?: number };

export type BulletinImageInput = {
  cloudinaryId: string;
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
