import { expect } from 'chai';
import { AxiosInstance } from 'axios';
import { AppDataSource } from '../../src/data-source';
import { comparePassword } from '../../src/encryptPassword';
import { User } from '../../src/entity/User';
import { BadRequestError } from '../../src/errors/bad-request.error';
import { ConflictError } from '../../src/errors/conflict.error';
import { errorMessages } from '../../src/errors/error-messages';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { UserInput } from '../../src/inputs/user-input';
import { mutationLogin, mutationCreateUser } from '../queries';
import { ApolloErrorFormat } from '../apollo-error-format';

export function createUserMutationTest(connection: AxiosInstance, mochaUser: UserInput) {
  describe('CreateUser Mutation Test', () => {
    afterEach(async () => {
      await AppDataSource.getRepository(User).delete({ email: mochaUser.email });
    });

    it('Should newUser inserted in database and graphql result be equal to input', async () => {
      const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

      const createdUser = (await mutationCreateUser(connection, mochaUser, loginResult.token)).data
        .createUser as UserInput;
      const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: mochaUser.email });

      const isSamePassword = await comparePassword(mochaUser.password, userInDatabase.password);

      expect(isSamePassword).to.be.true;
      expect(userInDatabase.id).to.be.gt(0);
      expect(userInDatabase.name).to.be.eq(mochaUser.name);
      expect(userInDatabase.email).to.be.eq(mochaUser.email);
      expect(userInDatabase.birthdate).to.be.eq(mochaUser.birthdate);

      expect(createdUser).to.be.deep.eq({
        id: userInDatabase.id,
        name: mochaUser.name,
        email: mochaUser.email,
        birthdate: mochaUser.birthdate,
      });
    });

    it('Should give an error when trying to create a user without being logged', async () => {
      const apolloErrors = (await mutationCreateUser(connection, mochaUser, undefined)).errors as ApolloErrorFormat[];
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

    it('Should give an error when creating a user with an already existing email', async () => {
      const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

      await mutationCreateUser(connection, mochaUser, loginResult.token);

      const apolloErrors = (await mutationCreateUser(connection, mochaUser, loginResult.token))
        .errors as ApolloErrorFormat[];
      const conflictError = new ConflictError('');
      const duplicatedEmailError = apolloErrors.find(
        (error) => error.code === conflictError.code && error.message === errorMessages.duplicatedEmail,
      );

      expect(apolloErrors.length).to.be.gt(0);
      expect(duplicatedEmailError).to.be.deep.eq({
        code: conflictError.code,
        details: '',
        message: errorMessages.duplicatedEmail,
      });
    });

    it('Should give an error when creating a user with an invalid password', async () => {
      const mochaUserInvalid = Object.assign({}, mochaUser);
      mochaUserInvalid.password = 'mochauserPassword';

      const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

      const apolloErrors = (await mutationCreateUser(connection, mochaUserInvalid, loginResult.token))
        .errors as ApolloErrorFormat[];
      const badRequestError = new BadRequestError('');
      const invalidPasswordError = apolloErrors.find(
        (error) => error.code === badRequestError.code && error.message === errorMessages.passwordInvalid,
      );

      expect(apolloErrors.length).to.be.gt(0);
      expect(invalidPasswordError).to.be.deep.eq({
        code: badRequestError.code,
        details: '',
        message: errorMessages.passwordInvalid,
      });
    });
  });
}
