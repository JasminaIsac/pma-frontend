import { ID, ISODate } from './common';
import { UserRole } from './enums';
import { User } from './user';
import { Project } from './project';

export interface UserToProjectBase {
  id: ID;
  projectId: ID;
  userId: ID;
  userRole: UserRole;
  createdAt: ISODate;
  updatedAt?: ISODate;
}

export interface UserToProject extends UserToProjectBase {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
  project: Pick<Project, 'id' | 'name' | 'description'>;
}

export interface ProjectMember extends UserToProjectBase {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatarUrl'>;
}

export interface UserProject extends UserToProjectBase {
  project: Pick<Project, 'id' | 'name' | 'description' | 'status'>;
}

export interface CreateUserToProjectDTO {
  projectId: ID;
  userId: ID;
  userRole: UserRole;
}

export interface UpdateUserToProjectDTO {
  projectId?: ID;
  userId?: ID;
  userRole?: UserRole;
}