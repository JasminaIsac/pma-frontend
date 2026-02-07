export type ID = string;
export type ISODate = string;

export interface CursorResponse<T> {
  pages?: any;
  items: T[];
  nextCursor: ID | string | null;
  hasMore: boolean;
}
