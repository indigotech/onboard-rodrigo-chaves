import { expect } from 'chai';
import { queryUser } from '../queries';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { comparePassword } from '../../src/encryptPassword';
import { errorMessages } from '../../src/errors/error-messages';
import { NotFoundError } from '../../src/errors/not-found.error';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { createMochaUserEntity, mochaUser } from '../mocha-user';
import { generateToken } from '../../src/jwt-utils';
import { Address } from '../../src/entity/Address';
import { createRandomAddress } from './create-random-address';

describe('User Query Test', () => {
  afterEach(async () => {
    await AppDataSource.getRepository(Address).delete({});
    await AppDataSource.getRepository(User).delete({ email: mochaUser.email });
  });

  it('Should bring a user and its addresses when passing a valid ID', async () => {
    const testToken = generateToken('1', false);
    const testUser = await createMochaUserEntity();
    const createdUser = await AppDataSource.getRepository(User).save(testUser);

    const testAddresses = [createRandomAddress(createdUser), createRandomAddress(createdUser)];
    await AppDataSource.getRepository(Address).save(testAddresses);

    const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: testUser.email });
    const addressesInDatabase = await AppDataSource.getRepository(Address).findBy({ user: createdUser });

    const userQueryResult = (await queryUser(userInDatabase.id, testToken)).data.user;

    const isSamePassword = await comparePassword(mochaUser.password, userInDatabase.password);
    expect(isSamePassword).to.be.true;

    delete userQueryResult.password;

    expect(userQueryResult.addresses.length).to.be.eq(testAddresses.length);
    expect(userQueryResult).to.be.deep.eq({
      id: userInDatabase.id,
      name: createdUser.name,
      email: createdUser.email,
      birthdate: createdUser.birthdate,
      addresses: addressesInDatabase,
    });
  });

  it('Should give an error when executing the query without being authenticated', async () => {
    const apolloErrors = (await queryUser(1, '')).errors;

    const unauthorizedError = new UnauthorizedError('');
    const userNotAuthenticatedError = apolloErrors.find(
      (error) => error.code === unauthorizedError.code && errorMessages.notAuthenticated,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(userNotAuthenticatedError).to.be.deep.eq({
      code: unauthorizedError.code,
      details: '',
      message: errorMessages.notAuthenticated,
    });
  });

  it('Should give an error passing an invalid/not-existing ID', async () => {
    const testToken = generateToken('1', false);
    const apolloErrors = (await queryUser(14500000, testToken)).errors;

    const notFoundError = new NotFoundError('');
    const userNotFoundError = apolloErrors.find(
      (error) => error.code === notFoundError.code && errorMessages.userNotFound,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(userNotFoundError).to.be.deep.eq({
      code: notFoundError.code,
      details: '',
      message: errorMessages.userNotFound,
    });
  });
});
