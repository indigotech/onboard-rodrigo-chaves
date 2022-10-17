import { encryptPassword } from '../src/encryptPassword';
import { User } from '../src/entity/User';

export const mochaUser = {
  name: 'MochaUser',
  email: 'mochauser@email.com',
  password: 'mochauserPassword1',
  birthdate: '01-01-1993',
};

export async function createMochaUserEntity() {
  const mochaUserEntity = new User();
  Object.assign(mochaUserEntity, mochaUser);

  mochaUserEntity.password = await encryptPassword(mochaUserEntity.password);

  return mochaUserEntity;
}
