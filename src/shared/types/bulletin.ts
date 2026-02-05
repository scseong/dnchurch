import { BulletinType } from '@/shared/types/types';

export type BulletinParams = { year?: number; page?: number; limit?: number };

export type BulletinFormParams = {
  title: string;
  date: string;
  imageUrls: string[];
  userId: string;
};

export type BulletinSummaryResponse = {
  latest: BulletinType;
  years: number[];
  items: BulletinType[];
  total: number;
};
