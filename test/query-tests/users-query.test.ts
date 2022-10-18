import { expect } from 'chai';
import { queryUsers } from '../queries';
import { errorMessages } from '../../src/errors/error-messages';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { DEFAULT_LIMIT } from '../../src/queries/get-users';
import { generateToken } from '../../src/jwt-utils';
import { populateDatabase } from '../../seed/populate-database';

describe('Users List Query Test', () => {
  before(async () => {
    await populateDatabase();
  });

  after(async () => {
    await AppDataSource.manager.getRepository(User).delete({});
  });

  it('Should bring a list of users with length equal to limit option passed', async () => {
    const testToken = generateToken('1', false);
    const limit = 35;
    const usersQueryResult = (await queryUsers(testToken, limit)).data.users;

    const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
      skip: 0,
      take: limit,
      order: {
        name: 'ASC',
      },
    });

    expect(usersQueryResult.length).to.be.eq(limit);
    expect(usersQueryResult.length).to.be.eq(usersInDatabase.length);

    for (let index = 0; index < limit; index++) {
      expect(usersQueryResult[index]).to.be.deep.eq({
        id: usersInDatabase[index].id,
        name: usersInDatabase[index].name,
        email: usersInDatabase[index].email,
        birthdate: usersInDatabase[index].birthdate,
      });
    }
  });

  it('Should bring a list of users with length equal to default limit option', async () => {
    const testToken = generateToken('1', false);
    const usersQueryResult = (await queryUsers(testToken)).data.users;

    const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
      skip: 0,
      take: DEFAULT_LIMIT,
      order: {
        name: 'ASC',
      },
    });

    expect(usersQueryResult.length).to.be.eq(usersInDatabase.length);

    for (let index = 0; index < DEFAULT_LIMIT; index++) {
      expect(usersQueryResult[index]).to.be.deep.eq({
        id: usersInDatabase[index].id,
        name: usersInDatabase[index].name,
        email: usersInDatabase[index].email,
        birthdate: usersInDatabase[index].birthdate,
      });
    }
  });

  it('Should bring an error when trying to list users without being authenticated', async () => {
    const apolloErrors = (await queryUsers(undefined)).errors;

    const unauthorizedError = new UnauthorizedError('');
    const notAuthenticatedError = apolloErrors.find(
      (error) => error.code === unauthorizedError.code && error.message === errorMessages.notAuthenticated,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(notAuthenticatedError).to.be.deep.eq({
      code: unauthorizedError.code,
      details: '',
      message: errorMessages.notAuthenticated,
    });
  });
});
