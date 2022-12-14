import { UserInput } from '../src/inputs/user-input';
import { ApolloErrorFormat } from './apollo-error-format';
import { User } from './entity/User';
import { LoginInput } from './inputs/login-input';
import { PaginationInput } from './inputs/pagination-input';
import { queryUserQL, mutationCreateUserQL, mutationLoginQL, queryUsersQL } from './queries-ql';
import { UsersPaginated } from './queries/users-paginated-type';
import { connection } from './test-server-connection';

interface GraphQLReturn<T> {
  errors?: ApolloErrorFormat[];
  data?: T;
}

export async function queryUser(id: number, token: string): Promise<GraphQLReturn<{ user: User }>> {
  const data = {
    query: queryUserQL,
    variables: { id },
  };

  const headers = {
    Authorization: token,
  };

  const result = await connection.post('/graphql', data, { headers });

  return result.data;
}

export async function queryUsers(
  token: string,
  input: PaginationInput,
): Promise<GraphQLReturn<{ users: UsersPaginated }>> {
  const data = {
    query: queryUsersQL,
    variables: { input },
  };

  const headers = {
    Authorization: token,
  };

  const result = await connection.post('/graphql', data, { headers });

  return result.data;
}

export async function mutationCreateUser(
  newUser: UserInput,
  token: string,
): Promise<GraphQLReturn<{ createUser: User }>> {
  const data = {
    query: mutationCreateUserQL,
    variables: { input: newUser },
  };

  const headers = {
    Authorization: token,
  };

  const result = await connection.post('/graphql', data, { headers });

  return result.data;
}

export async function mutationLogin(input: LoginInput): Promise<
  GraphQLReturn<{
    login: {
      user: User;
      token: string;
    };
  }>
> {
  const result = await connection.post('/graphql', {
    query: mutationLoginQL,
    variables: { input },
  });

  return result.data;
}
