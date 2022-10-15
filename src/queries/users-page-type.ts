import { UserInput } from '../inputs/user-input';

export interface UsersPage {
  total: number;
  before: number;
  after: number;
  users: UserInput[];
}
