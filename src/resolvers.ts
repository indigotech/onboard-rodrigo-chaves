import { getUser } from './queries/get-user';
import { createUser } from './mutations/create-user';
import { login } from './mutations/login';

export const resolvers = {
  Query: {
    user: getUser,
  },
  Mutation: {
    createUser,
    login,
  },
};
