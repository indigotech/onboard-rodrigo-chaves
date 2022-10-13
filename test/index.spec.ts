import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/test.env` });

import axios from 'axios';
import { expect } from 'chai';
import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { comparePassword } from '../src/encryptPassword';
import { mutationCreateUser, mutationLogin, queryUser } from './queries';
import { ConflictError } from '../src/errors/conflict.error';
import { BadRequestError } from '../src/errors/bad-request.error';
import { UserInput } from '../src/inputs/user-input';
import { errorMessages } from '../src/errors/error-messages';
import { NotFoundError } from '../src/errors/not-found.error';
import { UnauthorizedError } from '../src/errors/unauthorized.error';

interface ApolloErrorFormat {
  message: string;
  code: number;
  details: string;
}

const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });

const mochaUser = {
  name: 'MochaUser',
  email: 'mochauser@email.com',
  password: 'mochauserPassword1',
  birthdate: '01-01-1993',
};

before(async () => {
  await AppDataSource.initialize();
  await initApolloServer();
});

describe('Users Query Test', () => {
  it('Should bring number of users from database if server is online', async () => {
    const result = (await queryUser(connection)).data.users as UserInput[];
    expect(result.length).to.be.gt(0);
  });
});

describe('CreateUser Mutation Test', () => {
  afterEach(async () => {
    await AppDataSource.getRepository(User).delete({ email: mochaUser.email });
  });

  it('Should newUser inserted in database and graphql result be equal to input', async () => {
    const createdUser = (await mutationCreateUser(connection, mochaUser)).data.createUser as UserInput;
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

  it('Should give an error when creating a user with an already existent email', async () => {
    await mutationCreateUser(connection, mochaUser);

    const apolloErrors = (await mutationCreateUser(connection, mochaUser)).errors as ApolloErrorFormat[];
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

    const apolloErrors = (await mutationCreateUser(connection, mochaUserInvalid)).errors as ApolloErrorFormat[];
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

describe('Login Mutation Test', () => {
  afterEach(async () => {
    await AppDataSource.getRepository(User).delete({ email: mochaUser.email });
  });

  it('Should return be the user that has the same email from input and a token', async () => {
    await mutationCreateUser(connection, mochaUser);
    const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: mochaUser.email });

    const loginResult = (await mutationLogin(connection, mochaUser.email, mochaUser.password)).data.login;

    expect(loginResult.user).to.be.deep.eq({
      id: userInDatabase.id,
      name: mochaUser.name,
      email: mochaUser.email,
      birthdate: mochaUser.birthdate,
    });

    expect(loginResult.token).to.be.a('string');
    expect(loginResult.token.length).to.be.gt(0);
  });

  it('Should return an error when trying to login with a non-existent email', async () => {
    const apolloErrors = (await mutationLogin(connection, 'mochauserNotExistent@email.com', 'SomePassword1'))
      .errors as ApolloErrorFormat[];

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
    await mutationCreateUser(connection, mochaUser);

    const apolloErrors = (await mutationLogin(connection, mochaUser.email, 'mochauserPassword123'))
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
