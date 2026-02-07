export enum ConversationType {
  PRIVATE = 'PRIVATE',
  GROUP = 'GROUP',
}

export enum ProjectStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export enum TaskStatus {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  PAUSED = 'PAUSED',
  TO_CHECK = 'TO_CHECK',
  COMPLETED = 'COMPLETED',
  RETURNED = 'RETURNED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum UserRole {
  ROOT = 'ROOT',
  ADMIN = 'ADMIN',
  PROJECT_MANAGER = 'PROJECT_MANAGER',
  DEVELOPER = 'DEVELOPER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

export enum LogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
}

export enum LogEntity {
  PROJECT = 'PROJECT',
  TASK = 'TASK',
  USER = 'USER',
  CATEGORY = 'CATEGORY',
}
