import { AxiosInstance } from 'axios';
import { LoginInput, UserInput } from './resolvers';

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

export async function mutationLogin(connection: AxiosInstance, input: LoginInput) {
  const query = `mutation Login($input: LoginInput) {
                    login(input: $input) {
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
    variables: { input },
  });

  return result.data;
}
