export type AppSitemapNode = {
  path: string;
  label: string;
  /** 동적 상세 라우트 여부 (e.g. /sermons/:id) */
  detail?: boolean;
  children?: AppSitemapNode[];
};
