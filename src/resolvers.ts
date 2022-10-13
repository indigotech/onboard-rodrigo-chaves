import { getUsers } from './queries/users';
import { createUser } from './mutations/create-user';
import { login } from './mutations/login';

export const resolvers = {
  Query: {
    users: getUsers,
  },
  Mutation: {
    createUser,
    login,
  },
};
