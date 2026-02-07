import { ID, ISODate } from './common';

export interface Category {
  id: ID;
  name: string;
  createdAt: ISODate;
  updatedAt: ISODate;
  isRestored?: boolean;
}

export interface CreateCategoryDTO {
  name: string;
};

export interface UpdateCategoryDTO {
  name?: string;
};