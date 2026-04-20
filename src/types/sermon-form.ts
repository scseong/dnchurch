import type { Dispatch, SetStateAction } from 'react';
import type { Database } from '@/types/database.types';
import type { ServiceType } from '@/types/sermon';

export type VideoProvider = 'youtube' | 'vimeo';
export type SermonResourceType = Database['public']['Enums']['sermon_resource_type'];

export interface SermonResourceInput {
  id: string;
  name: string;
  size: number;
  fileType: SermonResourceType;
  url?: string;
}

export interface SermonFormData {
  title: string;
  slug: string;
  slugTouched: boolean;
  sermonDate: string;
  preacherId: string;
  seriesId: string;
  seriesOrder: number | '';
  serviceType: ServiceType | '';

  videoProvider: VideoProvider;
  videoUrl: string;
  videoId: string;
  duration: string;
  thumbnailUrl: string;
  thumbnailManual: boolean;

  scripture: string;
  scriptureText: string;
  summary: string;

  resources: SermonResourceInput[];

  isPublished: boolean;
}

export const INITIAL_SERMON_FORM_DATA: SermonFormData = {
  title: '',
  slug: '',
  slugTouched: false,
  sermonDate: '',
  preacherId: '',
  seriesId: '',
  seriesOrder: '',
  serviceType: '',
  videoProvider: 'youtube',
  videoUrl: '',
  videoId: '',
  duration: '',
  thumbnailUrl: '',
  thumbnailManual: false,
  scripture: '',
  scriptureText: '',
  summary: '',
  resources: [],
  isPublished: false
};

export type SermonCardProps = {
  data: SermonFormData;
  setData: Dispatch<SetStateAction<SermonFormData>>;
};
