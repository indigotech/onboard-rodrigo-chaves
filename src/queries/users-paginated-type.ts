import { User } from '../entity/User';

export interface UsersPaginated {
  total: number;
  before: number;
  after: number;
  users: User[];
}
