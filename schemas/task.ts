import { ID, ISODate } from './common';
import { TaskPriority, TaskStatus } from './enums';

export interface Task {
  id: ID;
  name: string;
  description: string | null;
  projectId: ID;
  assignedTo: ID;
  priority: TaskPriority;
  status: TaskStatus;
  deadline: ISODate;
  createdAt: ISODate;
  updatedAt: ISODate;
  deletedAt?: ISODate | null;
}

export interface TaskWithRelations extends Task {
  project: {
    id: ID;
    name: string;
  };
  assignee: {
    id: ID;
    name: string;
  };
}

export interface CreateTaskDTO {
  name: string;
  description?: string;
  projectId: ID;
  assignedTo: ID;
  deadline: ISODate;
  priority?: TaskPriority;
}

export interface UpdateTaskDTO {
  name?: string;
  description?: string | null;
  projectId?: ID;
  assignedTo?: ID;
  deadline?: ISODate;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export type TaskCountByMember = {
  userId: string;
  taskCount: number;
};