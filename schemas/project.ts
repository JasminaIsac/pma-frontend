import { ID, ISODate } from './common';
import { ProjectStatus, UserRole } from './enums';

export interface Project {
  id: ID;
  name: string;
  description: string | null;
  categoryId: ID;
  category: {
    name: string;
  };
  managerId: ID;
  manager: {
    name: string;
  };
  status: ProjectStatus;
  coverUrl?: string | null;
  deadline?: ISODate | null;
  createdAt: ISODate;
  updatedAt: ISODate;
}

export interface CreateProjectDTO {
  name: string;
  description?: string | null;
  categoryId: ID;
  managerId: ID;
  deadline?: ISODate | null;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string | null;
  categoryId?: ID;
  status?: ProjectStatus;
  managerId?: ID;
  deadline?: ISODate | null;
  updatedAt?: ISODate | null;
}

export type ProjectCountByCategory = {
  categoryId: string;
  projectsCount: number;
};