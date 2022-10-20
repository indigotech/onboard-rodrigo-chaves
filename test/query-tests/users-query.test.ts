import { expect } from 'chai';
import { queryUsers } from '../queries';
import { errorMessages } from '../../src/errors/error-messages';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { BadRequestError } from '../../src/errors/bad-request.error';
import { generateToken } from '../../src/jwt-utils';
import { DEFAULT_LIMIT } from '../../src/queries/get-users';
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
    const usersPaginated = (await queryUsers(testToken, { limit })).data.users;

    const skip = 0;
    const totalUsersInDatabase = await AppDataSource.manager.getRepository(User).count();
    const usersListInDatabase = await AppDataSource.manager.getRepository(User).find({
      skip,
      take: limit,
      order: {
        name: 'ASC',
      },
    });

    expect(usersPaginated.total).to.be.eq(totalUsersInDatabase);
    expect(usersPaginated.before).to.be.eq(skip);
    expect(usersPaginated.after).to.be.eq(totalUsersInDatabase - limit);

    expect(usersPaginated.users.length).to.be.eq(limit);
    expect(usersPaginated.users.length).to.be.eq(usersListInDatabase.length);

    for (let index = 0; index < limit; index++) {
      expect(usersPaginated.users[index]).to.be.deep.eq({
        id: usersListInDatabase[index].id,
        name: usersListInDatabase[index].name,
        email: usersListInDatabase[index].email,
        birthdate: usersListInDatabase[index].birthdate,
      });
    }
  });

  it('Should bring a list of users with length equal to default limit option', async () => {
    const testToken = generateToken('1', false);
    const usersPaginated = (await queryUsers(testToken, {})).data.users;

    const skip = 0;
    const totalUsersInDatabase = await AppDataSource.manager.getRepository(User).count();
    const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
      skip,
      take: DEFAULT_LIMIT,
      order: {
        name: 'ASC',
      },
    });

    expect(usersPaginated.total).to.be.eq(totalUsersInDatabase);
    expect(usersPaginated.before).to.be.eq(skip);
    expect(usersPaginated.after).to.be.eq(totalUsersInDatabase - DEFAULT_LIMIT);
    expect(usersPaginated.users.length).to.be.eq(usersInDatabase.length);

    for (let index = 0; index < DEFAULT_LIMIT; index++) {
      expect(usersPaginated.users[index]).to.be.deep.eq({
        id: usersInDatabase[index].id,
        name: usersInDatabase[index].name,
        email: usersInDatabase[index].email,
        birthdate: usersInDatabase[index].birthdate,
      });
    }
  });

  it('Should bring a list of users skipping an amount based on offset', async () => {
    const testToken = generateToken('1', false);

    const limit = 10;
    const offset = 2;
    const usersPaginated = (await queryUsers(testToken, { limit, offset })).data.users;

    const skip = limit * offset;
    const totalUsersInDatabase = await AppDataSource.manager.getRepository(User).count();
    const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
      skip,
      take: limit,
      order: {
        name: 'ASC',
      },
    });

    expect(usersPaginated.total).to.be.eq(totalUsersInDatabase);
    expect(usersPaginated.before).to.be.eq(skip);
    expect(usersPaginated.after).to.be.eq(totalUsersInDatabase - limit - skip);
    expect(usersPaginated.users.length).to.be.eq(usersInDatabase.length);

    for (let index = 0; index < limit; index++) {
      expect(usersPaginated.users[index]).to.be.deep.eq({
        id: usersInDatabase[index].id,
        name: usersInDatabase[index].name,
        email: usersInDatabase[index].email,
        birthdate: usersInDatabase[index].birthdate,
      });
    }
  });

  it('Should bring users equal to limit when trying to pass an offset too big', async () => {
    const testToken = generateToken('1', false);

    const limit = 10;
    const offset = 65000;
    const usersPaginated = (await queryUsers(testToken, { limit, offset })).data.users;

    expect(usersPaginated.users.length).to.be.eq(limit);
  });

  it('Should bring an error when trying to pass a negative offset', async () => {
    const testToken = generateToken('1', false);

    const limit = 10;
    const offset = -3;
    const apolloErrors = (await queryUsers(testToken, { limit, offset })).errors;

    const badRequestError = new BadRequestError('');
    const negativeLimitError = apolloErrors.find(
      (error) => error.code === badRequestError.code && error.message === errorMessages.invalidOffset,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(negativeLimitError).to.be.deep.eq({
      code: badRequestError.code,
      details: '',
      message: errorMessages.invalidOffset,
    });
  });

  it('Should bring less users than limit value when limit is bigger than available users in database', async () => {
    const testToken = generateToken('1', false);

    const limit = 35;
    const offset = 1;
    const usersPaginated = (await queryUsers(testToken, { limit, offset })).data.users;

    const skip = limit * offset;
    const totalUsersInDatabase = await AppDataSource.manager.getRepository(User).count();
    const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
      skip,
      take: limit,
      order: {
        name: 'ASC',
      },
    });

    expect(usersPaginated.total).to.be.eq(totalUsersInDatabase);
    expect(usersPaginated.before).to.be.eq(skip);
    expect(usersPaginated.after).to.be.eq(0);

    const remainingUsers = totalUsersInDatabase - limit;
    expect(usersPaginated.users.length).to.be.eq(remainingUsers);
    expect(usersPaginated.users.length).to.be.eq(usersInDatabase.length);

    for (let index = 0; index < remainingUsers; index++) {
      expect(usersPaginated.users[index]).to.be.deep.eq({
        id: usersInDatabase[index].id,
        name: usersInDatabase[index].name,
        email: usersInDatabase[index].email,
        birthdate: usersInDatabase[index].birthdate,
      });
    }
  });

  it('Should bring an error when trying to pass a negative limit value', async () => {
    const testToken = generateToken('1', false);

    const limit = -10;
    const apolloErrors = (await queryUsers(testToken, { limit })).errors;

    const badRequestError = new BadRequestError('');
    const negativeLimitError = apolloErrors.find(
      (error) => error.code === badRequestError.code && error.message === errorMessages.invalidLimit,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(negativeLimitError).to.be.deep.eq({
      code: badRequestError.code,
      details: '',
      message: errorMessages.invalidLimit,
    });
  });

  it('Should bring an error when trying to list users without being authenticated', async () => {
    const apolloErrors = (await queryUsers(undefined, {})).errors;

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
