import { expect } from 'chai';
import { queryUsers } from '../queries';
import { errorMessages } from '../../src/errors/error-messages';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { BadRequestError } from '../../src/errors/bad-request.error';
import { generateToken } from '../../src/jwt-utils';
import { DEFAULT_LIMIT } from '../queries/get-users';

  describe('Users List Query Test', () => {
    it('Should bring a list of users with length equal to limit option passed', async () => {
      const testToken = generateToken('1', false);
      const limit = 35;
      const usersQueryResult = (await queryUsers(testToken, limit)).data.users;

      const skip = 0;
      const totalUsersInDatabase = await AppDataSource.manager.getRepository(User).count();
      const usersListInDatabase = await AppDataSource.manager.getRepository(User).find({
        skip,
        take: limit,
        order: {
          name: 'ASC',
        },
      });

      expect(usersQueryResult.total).to.be.eq(totalUsersInDatabase);
      expect(usersQueryResult.before).to.be.eq(skip);
      expect(usersQueryResult.after).to.be.eq(totalUsersInDatabase - limit);

      expect(usersQueryResult.page.length).to.be.eq(limit);
      expect(usersQueryResult.page.length).to.be.eq(usersListInDatabase.length);

      for (let index = 0; index < limit; index++) {
        expect(usersQueryResult.page[index]).to.be.deep.eq({
          id: usersListInDatabase[index].id,
          name: usersListInDatabase[index].name,
          email: usersListInDatabase[index].email,
          birthdate: usersListInDatabase[index].birthdate,
        });
      }
    });

    it('Should bring a list of users with length equal to default limit option', async () => {
      const testToken = generateToken('1', false);

      const defaultLimit = 5;
      const usersQueryResult = (await queryUsers(testToken)).data.users;

      const skip = 0;
      const totalUsersInDatabase = await AppDataSource.manager.getRepository(User).count();
      const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
        skip,
        take: defaultLimit,
        order: {
          name: 'ASC',
        },
      });
    }

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
      expect(usersQueryResult.total).to.be.eq(totalUsersInDatabase);
      expect(usersQueryResult.before).to.be.eq(skip);
      expect(usersQueryResult.after).to.be.eq(totalUsersInDatabase - defaultLimit);

      expect(usersQueryResult.page.length).to.be.eq(defaultLimit);
      expect(usersQueryResult.page.length).to.be.eq(usersInDatabase.length);

      for (let index = 0; index < DEFAULT_LIMIT; index++) {
        expect(usersQueryResult[index]).to.be.deep.eq({
          id: usersInDatabase[index].id,
          name: usersInDatabase[index].name,
          email: usersInDatabase[index].email,
          birthdate: usersInDatabase[index].birthdate,
        });
      }
    });

    it('Should bring a list of users skipping an amount based on index', async () => {
      const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

      const limit = 10;
      const index = 2;
      const usersQueryResult = (await queryUsers(connection, loginResult.token, limit, index)).data.users;

      const skip = limit;
      const totalUsersInDatabase = await AppDataSource.manager.getRepository(User).count();
      const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
        skip,
        take: limit,
        order: {
          name: 'ASC',
        },
      });

      expect(usersQueryResult.total).to.be.eq(totalUsersInDatabase);
      expect(usersQueryResult.before).to.be.eq(limit);
      expect(usersQueryResult.after).to.be.eq(totalUsersInDatabase - limit - skip);

      expect(usersQueryResult.page.length).to.be.eq(limit);
      expect(usersQueryResult.page.length).to.be.eq(usersInDatabase.length);

      for (let index = 0; index < limit; index++) {
        expect(usersQueryResult.page[index]).to.be.deep.eq({
          id: usersInDatabase[index].id,
          name: usersInDatabase[index].name,
          email: usersInDatabase[index].email,
          birthdate: usersInDatabase[index].birthdate,
        });
      }
    });

    it('Should bring an error when trying to pass an index bigger than available indexes list', async () => {
      const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

      const apolloErrors = (await queryUsers(connection, loginResult.token, 10, 65000)).errors as ApolloErrorFormat[];

      const badRequestError = new BadRequestError('');
      const indexTooBigError = apolloErrors.find(
        (error) => error.code === badRequestError.code && error.message === errorMessages.indexInvalid,
      );

      expect(apolloErrors.length).to.be.gt(0);
      expect(indexTooBigError).to.be.deep.eq({
        code: badRequestError.code,
        details: '',
        message: errorMessages.indexInvalid,
      });
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