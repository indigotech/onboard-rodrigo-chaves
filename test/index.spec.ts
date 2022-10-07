import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/test.env` });

import axios from 'axios';
import { expect } from 'chai';
import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { comparePassword } from '../src/encryptPassword';

const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });

before(async () => {
  await AppDataSource.initialize();
  await initApolloServer();
});

describe('Users Query Test', () => {
  it('Should bring number of users from database if server is online', async () => {
    const query = `query User{
      users{
        id
        name
        email
        birthdate
      }
    }`;

    const result = await connection.post('/graphql', { query });
    expect(result.data.data.users.length).to.be.eq(5);
  });
});

describe('CreateUser Mutation Test', () => {
  it('Should result have the same data that was informed in the input', async () => {
    const query = `mutation CreateUser($input: UserInput){
      createUser(input: $input) {
        id
        name
        email
        birthdate
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
    const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: input.email });

    const isSamePassword = await comparePassword(input.password, userInDatabase.password);

    expect(userInDatabase.id).to.be.gt(0);
    expect(userInDatabase.name).to.be.eq(input.name);
    expect(userInDatabase.email).to.be.eq(input.email);
    expect(isSamePassword).to.be.true;
    expect(userInDatabase.birthdate).to.be.eq(input.birthdate);

    expect(createdUser).to.be.deep.eq({
      id: userInDatabase.id,
      name: input.name,
      email: input.email,
      birthdate: input.birthdate,
    });

    after(async () => {
      await AppDataSource.getRepository(User).delete({ email: input.email });
    });
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
