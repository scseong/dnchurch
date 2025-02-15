export type LayoutProps = {
  children?: React.ReactNode;
  params?: Promise<{ [key: string]: string | string[] | null }>;
};
