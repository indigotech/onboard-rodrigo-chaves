import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/test.env` });

import axios from 'axios';
import { expect } from 'chai';
import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';

const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });

before(async () => {
  await AppDataSource.initialize();
  await initApolloServer();
});

describe('Axios Query', () => {
  it('Query - Should bring number of users from database if server is online', async () => {
    const query = `query User{
      users{id, name, email, birthdate}
    }`;

    const result = await connection.post('/graphql', { query });
    expect(result.data.data.users.length).to.be.eq(5);
  });
});

describe('Axios Mutation Test', () => {
  it('Mutation - Create a user and verify if the response is the same user informed in the input', async () => {
    const query = `mutation CreateUser($input: UserInput){
      createUser(input: $input) {
        id, name, email, birthdate
      }
    }`;

    const input = {
      name: 'MochaUser',
      email: 'mochauser@email.com',
      password: 'mochauserPassword1',
      birthdate: '01-01-1900',
    };

    const result = await connection.post('/graphql', {
      query,
      variables: { input },
    });

    const createdUser = result.data.data.createUser;

    expect(createdUser.id).to.be.a('number');
    expect(createdUser.name).to.be.equal(input.name);
    expect(createdUser.email).to.be.equal(input.email);
    expect(createdUser.birthdate).to.be.equal(input.birthdate);
  });
});
