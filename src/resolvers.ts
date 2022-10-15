import { getUser } from './queries/get-user';
import { createUser } from './mutations/create-user';
import { login } from './mutations/login';
import { getUsers } from './queries/get-users';

export const resolvers = {
  Query: {
    user: getUser,
    users: getUsers,
  },
  Mutation: {
    createUser,
    login,
  },
};
