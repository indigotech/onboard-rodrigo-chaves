import { expect } from 'chai';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { errorMessages } from '../../src/errors/error-messages';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { mutationLogin, mutationCreateUser } from '../queries';
import { ApolloErrorFormat } from '../apollo-error-format';
import { NotFoundError } from '../../src/errors/not-found.error';
import { mochaUser } from '../mocha-user';
import { connection } from '../test-server-connection';

describe('Login Mutation Test', () => {
  afterEach(async () => {
    await AppDataSource.getRepository(User).delete({ email: mochaUser.email });
  });

  it('Should return be the user that has the same email from input and a token', async () => {
    let loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;

    await mutationCreateUser(connection, mochaUser, loginResult.token);
    const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: mochaUser.email });

    loginResult = (await mutationLogin(connection, { email: mochaUser.email, password: mochaUser.password })).data
      .login;

    expect(loginResult.user).to.be.deep.eq({
      id: userInDatabase.id,
      name: mochaUser.name,
      email: mochaUser.email,
      birthdate: mochaUser.birthdate,
    });

    expect(loginResult.token).to.be.a('string');
    expect(loginResult.token.length).to.be.gt(0);
  });

  it('Should return an error when trying to login with a non-existing email', async () => {
    const apolloErrors = (
      await mutationLogin(connection, { email: 'mochauserNotExisting@email.com', password: 'SomePassword1' })
    ).errors as ApolloErrorFormat[];

    const notFoundError = new NotFoundError('');
    const emailNotFoundError = apolloErrors.find(
      (error) => error.code === notFoundError.code && errorMessages.emailNotFound,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(emailNotFoundError).to.be.deep.eq({
      code: notFoundError.code,
      details: '',
      message: errorMessages.emailNotFound,
    });
  });

  it('Should return an error when trying to login with an incorrect password', async () => {
    const loginResult = (await mutationLogin(connection, { email: 'test@email.com', password: 'Teste1' })).data.login;
    await mutationCreateUser(connection, mochaUser, loginResult.token);

    const apolloErrors = (await mutationLogin(connection, { email: mochaUser.email, password: 'mochauserPassword123' }))
      .errors as ApolloErrorFormat[];

    const unauthorizedError = new UnauthorizedError('');
    const passwordIncorrectError = apolloErrors.find(
      (error) => error.code === unauthorizedError.code && error.message === errorMessages.passwordIncorrect,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(passwordIncorrectError).to.be.deep.eq({
      code: unauthorizedError.code,
      details: '',
      message: errorMessages.passwordIncorrect,
    });
  });
});
