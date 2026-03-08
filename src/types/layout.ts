export type SitemapChild = {
  path: string;
  label: string;
  title: string;
  description: string;
  heroImageId: string;
};

export type SitemapItem = {
  path: string;
  label: string;
  title: string;
  description: string;
  heroImageId: string;
  inNav: boolean;
  children?: SitemapChild[];
};
