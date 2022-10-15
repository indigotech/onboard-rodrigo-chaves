import { expect } from 'chai';
import { AxiosInstance } from 'axios';
import { mutationCreateUser, mutationLogin, queryUser } from '../queries';
import { UserInput } from '../../src/inputs/user-input';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { comparePassword } from '../../src/encryptPassword';
import { ApolloErrorFormat } from '../apollo-error-format';
import { errorMessages } from '../../src/errors/error-messages';
import { NotFoundError } from '../../src/errors/not-found.error';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';

export function userQueryTest(connection: AxiosInstance, mochaUser: UserInput) {
  describe('User Query Test', () => {
    afterEach(async () => {
      await AppDataSource.getRepository(User).delete({ email: mochaUser.email });
    });

    it('Should bring a user when passing a valid ID', async () => {
      const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

      const createdUser = (await mutationCreateUser(connection, mochaUser, loginResult.token)).data
        .createUser as UserInput;
      const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: mochaUser.email });

      const userQueryResult = (await queryUser(connection, userInDatabase.id, loginResult.token)).data
        .user as UserInput;

      const isSamePassword = await comparePassword(mochaUser.password, userInDatabase.password);
      expect(isSamePassword).to.be.true;

      delete userQueryResult.password;

      expect(userQueryResult).to.be.deep.eq({
        id: userInDatabase.id,
        name: createdUser.name,
        email: createdUser.email,
        birthdate: createdUser.birthdate,
      });
    });

    it('Should give an error when executing the query without being authenticated', async () => {
      const apolloErrors = (await queryUser(connection, 1, '')).errors as ApolloErrorFormat[];

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
      const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

      const apolloErrors = (await queryUser(connection, 14500000, loginResult.token)).errors as ApolloErrorFormat[];

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
}
