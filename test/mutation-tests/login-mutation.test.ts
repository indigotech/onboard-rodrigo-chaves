import { expect } from 'chai';
import { AppDataSource } from '../../src/data-source';
import { User } from '../../src/entity/User';
import { errorMessages } from '../../src/errors/error-messages';
import { UnauthorizedError } from '../../src/errors/unauthorized.error';
import { mutationLogin } from '../queries';
import { NotFoundError } from '../../src/errors/not-found.error';
import { createMochaUserEntity, mochaUser } from '../mocha-user';
import { connection } from '../test-server-connection';

describe('Login Mutation Test', () => {
  afterEach(async () => {
    await AppDataSource.getRepository(User).delete({ email: mochaUser.email });
  });

  it('Should return be the user that has the same email from input and a token', async () => {
    const testUser = await createMochaUserEntity();
    const createdUser = await AppDataSource.getRepository(User).save(testUser);
    const loginResult = (await mutationLogin(connection, { email: createdUser.email, password: mochaUser.password }))
      .data.login;

    const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: createdUser.email });

    expect(loginResult.user).to.be.deep.eq({
      id: userInDatabase.id,
      name: createdUser.name,
      email: createdUser.email,
      birthdate: createdUser.birthdate,
    });

    expect(loginResult.token).to.be.a('string');
    expect(loginResult.token.length).to.be.gt(0);
  });

  it('Should return an error when trying to login with a non-existing email', async () => {
    const apolloErrors = (
      await mutationLogin(connection, { email: 'mochauserNotExisting@email.com', password: 'SomePassword1' })
    ).errors;

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
    const testUser = await createMochaUserEntity();
    const createdUser = await AppDataSource.getRepository(User).save(testUser);

    const apolloErrors = (await mutationLogin(connection, { email: createdUser.email, password: 'WrongPassword1' }))
      .errors;

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
