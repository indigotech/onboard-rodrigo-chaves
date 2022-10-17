import { expect } from 'chai';
import { AxiosInstance } from 'axios';
import { queryUsers } from '../queries';
import { UserInput } from '../../src/inputs/user-input';
import { ApolloErrorFormat } from '../apollo-error-format';
import { errorMessages } from '../../src/errors/error-messages';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { DEFAULT_LIMIT } from '../queries/get-users';
import { generateToken } from '../jwt-utils';

export function usersQueryTest(connection: AxiosInstance) {
  describe('Users List Query Test', () => {
    it('Should bring a list of users with length equal to limit option passed', async () => {
      const testToken = generateToken('1', false);
      const limit = 35;
      const usersQueryResult = (await queryUsers(connection, testToken, limit)).data.users as UserInput[];

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
      const usersQueryResult = (await queryUsers(connection, testToken)).data.users as UserInput[];

      const usersInDatabase = await AppDataSource.manager.getRepository(User).find({
        skip: 0,
        take: DEFAULT_LIMIT,
        order: {
          name: 'ASC',
        },
      });

      expect(usersQueryResult.length).to.be.eq(DEFAULT_LIMIT);
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
      const apolloErrors = (await queryUsers(connection, undefined)).errors as ApolloErrorFormat[];

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
}
