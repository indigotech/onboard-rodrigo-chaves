import { faker } from '@faker-js/faker';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { encryptPassword } from '../src/encryptPassword';
import { createRandomAddress } from '../test/query-tests/create-random-address';

const numberOfNewUsers = 50;

function createRandomUser(): User {
  const newUser = new User();
  newUser.name = faker.name.firstName();
  newUser.email = faker.internet.email();
  newUser.password = faker.word.noun() + Math.floor(Math.random() * 9);
  newUser.birthdate = faker.date.birthdate().toISOString();
  newUser.addresses = [createRandomAddress(newUser), createRandomAddress(newUser)];

  return newUser;
}

export async function populateDatabase() {
  const randomUsers: User[] = [];

  for (let index = 0; index < numberOfNewUsers; index++) {
    const newUser = createRandomUser();
    newUser.password = await encryptPassword(newUser.password);

    randomUsers.push(newUser);
  }

  await AppDataSource.getRepository(User).save(randomUsers);
}
