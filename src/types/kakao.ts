export type KakaoShareProps = {
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  buttonTitle?: string;
  objectType?: 'feed' | 'list' | 'location' | 'commerce' | 'text';
  children?: React.ReactNode;
};
