import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.test.env` });

import { faker } from '@faker-js/faker';
import axios from 'axios';
import { UserInput } from '../src/inputs/user-input';
import { AppDataSource } from '../src/data-source';
import { initApolloServer } from '../src/apollo-server';
import { mutationCreateUser, mutationLogin } from '../test/queries';

const numberOfNewUsers = 50;
const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });

function createRandomUser(): UserInput {
  return {
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.word.noun() + Math.floor(Math.random() * 9),
    birthdate: faker.date.birthdate().toISOString(),
  };
}

async function populateDatabase() {
  const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

  for (let index = 0; index < numberOfNewUsers; index++) {
    let isError = true;

    while (isError) {
      const newUser = createRandomUser();
      isError = (await mutationCreateUser(connection, newUser, loginResult.token)).errors;
    }
  }
}

async function initServer() {
  await AppDataSource.initialize();
  await initApolloServer();
  await populateDatabase();
}

initServer();
