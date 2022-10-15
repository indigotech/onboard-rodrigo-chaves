import { AxiosInstance } from 'axios';
import { UserInput } from '../src/inputs/user-input';
import { LoginInput } from './inputs/login-input';
import { queryUserQL, mutationCreateUserQL, mutationLoginQL } from './queriesQL';

export async function queryUser(connection: AxiosInstance, id: number, token: string) {
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

export async function mutationCreateUser(connection: AxiosInstance, newUser: UserInput, token: string) {
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

export async function mutationLogin(connection: AxiosInstance, input: LoginInput) {
  const result = await connection.post('/graphql', {
    query: mutationLoginQL,
    variables: { input },
  });

  return result.data;
}
