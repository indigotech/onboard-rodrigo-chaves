import { AxiosInstance } from 'axios';
import { UserInput } from './resolvers';

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

export async function mutationLogin(connection: AxiosInstance, email: string, password: string) {
  const query = `mutation Login($email: String!, $password: String!) {
                    login(email: $email, password: $password) {
                      user {
                        id
                        name
                        email
                        birthdate
                      },
                      token
                    }
                  }`;

  const result = await connection.post('/graphql', {
    query,
    variables: { email, password },
  });

  return result.data;
}
