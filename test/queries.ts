import { AxiosInstance } from 'axios';
import { UserInput } from '../src/inputs/user-input';
import { ApolloErrorFormat } from './apollo-error-format';
import { User } from './entity/User';
import { LoginInput } from './inputs/login-input';
import { queryUserQL, mutationCreateUserQL, mutationLoginQL, queryUsersQL } from './queries-ql';

interface GraphQLReturn<T> {
  errors?: ApolloErrorFormat[];
  data?: T;
}

export async function queryUser(
  connection: AxiosInstance,
  id: number,
  token: string,
): Promise<GraphQLReturn<{ user: User }>> {
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
  connection: AxiosInstance,
  token: string,
  limit?: number,
): Promise<GraphQLReturn<{ users: User[] }>> {
  const data = {
    query: queryUsersQL,
    variables: { limit },
  };

  const headers = {
    Authorization: token,
  };

  const result = await connection.post('/graphql', data, { headers });

  return result.data;
}

export async function mutationCreateUser(
  connection: AxiosInstance,
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

export async function mutationLogin(
  connection: AxiosInstance,
  input: LoginInput,
): Promise<
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
