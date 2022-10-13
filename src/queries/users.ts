import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

export function getUsers() {
  return AppDataSource.manager.getRepository(User).find();
}
