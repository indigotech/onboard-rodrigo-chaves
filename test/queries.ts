import { AxiosInstance } from 'axios';
import { UserInput } from './inputs/user-input';

export async function queryUser(connection: AxiosInstance) {
  const query = `query User{
                  users{
                    id
                    name
                    email
                    birthdate
                  }
                }`;

  const result = await connection.post('/graphql', { query });

  return result.data;
}

export async function mutationCreateUser(connection: AxiosInstance, newUser: UserInput) {
  const query = `mutation CreateUser($input: UserInput){
                  createUser(input: $input) {
                    id
                    name
                    email
                    birthdate
                  }
                }`;

  const result = await connection.post('/graphql', {
    query,
    variables: { input: newUser },
  });

  return result.data;
}
