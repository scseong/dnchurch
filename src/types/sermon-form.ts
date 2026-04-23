import type { Database } from '@/types/database.types';
import type { Preacher, SeriesWithSermonCount, ServiceType } from '@/types/sermon';

export type VideoProvider = 'youtube' | 'vimeo';
export type SermonResourceType = Database['public']['Enums']['sermon_resource_type'];

export interface SermonResourceInput {
  id: string;
  name: string;
  size: number;
  fileType: SermonResourceType;
  url?: string;
  file?: File;
}

export interface SermonFormData {
  title: string;
  sermonDate: string;
  preacherId: string;
  seriesId: string;
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
  sermonDate: '',
  preacherId: '',
  seriesId: '',
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

// 파생 필드(videoId, thumbnailUrl)는 applyPatch에서만 계산되어야 하므로 외부 패치 대상에서 제외.
type SermonFormInputKey = Exclude<keyof SermonFormData, 'videoId' | 'thumbnailUrl'>;
export type SermonFormPatch = Partial<Pick<SermonFormData, SermonFormInputKey>>;

export type BasicInfoCardProps = Pick<
  SermonFormData,
  'title' | 'sermonDate' | 'preacherId' | 'seriesId' | 'serviceType'
> & {
  preachers: Preacher[];
  series: SeriesWithSermonCount[];
  onChange: (patch: SermonFormPatch) => void;
};

export type VideoCardProps = Pick<
  SermonFormData,
  'videoProvider' | 'videoUrl' | 'videoId' | 'duration' | 'thumbnailUrl'
> & {
  onChange: (patch: SermonFormPatch) => void;
};

export type ScriptureCardProps = Pick<SermonFormData, 'scripture' | 'scriptureText' | 'summary'> & {
  onChange: (patch: SermonFormPatch) => void;
};

export type PublishCardProps = Pick<SermonFormData, 'isPublished'> & {
  onChange: (patch: SermonFormPatch) => void;
};

export type ResourcesCardProps = {
  resources: SermonResourceInput[];
  onAdd: (inputs: SermonResourceInput[]) => void;
  onRemove: (id: string) => void;
};
