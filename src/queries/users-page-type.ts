import { User } from '../entity/User';

export interface UsersPage {
  total: number;
  before: number;
  after: number;
  users: User[];
}
