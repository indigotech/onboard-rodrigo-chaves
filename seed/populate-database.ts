import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/.test.env` });

import { faker } from '@faker-js/faker';
import { UserInput } from '../src/inputs/user-input';
import { AppDataSource } from '../src/data-source';
import { initApolloServer } from '../src/apollo-server';
import { User } from '../src/entity/User';
import { encryptPassword } from '../src/encryptPassword';

const numberOfNewUsers = 50;

function createRandomUser(): UserInput {
  return {
    name: faker.name.firstName(),
    email: faker.internet.email(),
    password: faker.word.noun() + Math.floor(Math.random() * 9),
    birthdate: faker.date.birthdate().toISOString(),
  };
}

async function populateDatabase() {
  for (let index = 0; index < numberOfNewUsers; index++) {
    const newUser = createRandomUser();
    newUser.password = await encryptPassword(newUser.password);

    await AppDataSource.getRepository(User).save(newUser);
  }
}

async function initServer() {
  await AppDataSource.initialize();
  await initApolloServer();
  await populateDatabase();
}

initServer();
