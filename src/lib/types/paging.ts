export type Page<T> = {
  total: number;
  page: number;
  items: T[];
};

export type PageMeta = {
  page: number;
  offset: number;
  limit: number;
  total: number;
};
