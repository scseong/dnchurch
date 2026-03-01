import { BulletinType } from '@/types/common';

export type BulletinParams = { year?: number; page?: number; limit?: number };

export type BulletinFormParams = {
  title: string;
  date: string;
  imageUrls: string[];
  userId: string;
};

export type BulletinEditFormParams = Partial<BulletinFormParams> & {
  bulletinId: string;
};

export type BulletinSummaryResponse = {
  latest: BulletinType;
  years: number[];
  items: BulletinType[];
  total: number;
};

export type ExistingImageItem = {
  type: 'existing';
  url: string;
  id: string;
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
  date: string;
  images: ImageItem[];
};

export type BulletinFormProps = {
  mode: 'create' | 'edit';
  bulletinId?: string;
  initialData?: {
    title: string;
    date: string;
    imageUrls?: string[];
    userId: string;
  };
};
