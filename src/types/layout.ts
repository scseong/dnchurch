export type SitemapChild = {
  path: string;
  label: string;
  title: string;
  description: string;
};

export type SitemapItem = {
  path: string;
  label: string;
  title: string;
  description: string;
  inNav: boolean;
  children?: SitemapChild[];
};
