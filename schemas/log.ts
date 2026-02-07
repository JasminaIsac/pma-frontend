import { ID, ISODate } from './common';
import { LogAction, LogEntity } from './enums';
import { User } from './user';

export interface Log {
  id: ID;
  entity: LogEntity;
  entityId?: ID;
  action: LogAction;
  before?: string;
  after?: string;
  createdAt: ISODate;
  user: User;
}
