import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.test.env` });

import axios from 'axios';
import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';
import { userQueryTest } from './query-tests/user-query.test';
import { createUserMutationTest } from './mutation-tests/create-user-mutation.test';
import { loginMutationTest } from './mutation-tests/login-mutation.test';

const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });

const mochaUser = {
  name: 'MochaUser',
  email: 'mochauser@email.com',
  password: 'mochauserPassword1',
  birthdate: '01-01-1993',
};

before(async () => {
  await AppDataSource.initialize();
  await initApolloServer();
});

userQueryTest(connection, mochaUser);
createUserMutationTest(connection, mochaUser);
loginMutationTest(connection, mochaUser);
