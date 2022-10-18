import { faker } from '@faker-js/faker';
import { UserInput } from '../src/inputs/user-input';
import { AppDataSource } from '../src/data-source';
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

export async function populateDatabase() {
  const randomUsers: UserInput[] = [];

  for (let index = 0; index < numberOfNewUsers; index++) {
    const newUser = createRandomUser();
    newUser.password = await encryptPassword(newUser.password);

    randomUsers.push(newUser);
  }

  await AppDataSource.getRepository(User).save(randomUsers);
}
