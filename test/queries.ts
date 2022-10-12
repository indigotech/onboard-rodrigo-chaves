import { AxiosInstance } from 'axios';
import { UserInput } from '../src/inputs/user-input';
import { LoginInput } from './inputs/login-input';
import { queryUserQL, mutationCreateUserQL, mutationLoginQL } from './queriesQL';

export async function queryUser(connection: AxiosInstance) {
  const result = await connection.post('/graphql', { query: queryUserQL });

  return result.data;
}

export async function mutationCreateUser(connection: AxiosInstance, newUser: UserInput) {
  const result = await connection.post('/graphql', {
    query: mutationCreateUserQL,
    variables: { input: newUser },
  });

  return result.data;
}

export async function mutationLogin(connection: AxiosInstance, input: LoginInput) {
  const result = await connection.post('/graphql', {
    query: mutationLoginQL,
    variables: { input },
  });

  return result.data;
}
