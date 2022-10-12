import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/test.env` });

import axios from 'axios';
import { expect } from 'chai';
import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { comparePassword } from '../src/encryptPassword';
import { mutationCreateUser, mutationLogin, queryUser } from './queries';
import { UserInput } from './resolvers';
import { ConflictError } from '../src/errors/conflict.error';
import { BadRequestError } from '../src/errors/bad-request.error';
import { NotFoundError } from '../src/errors/not-found.error';
import { UnauthorizedError } from '../src/errors/unauthorized.error';

interface ApolloErrorFormat {
  message: string;
  code: number;
  details: string;
}

const connection = axios.create({ baseURL: `http://localhost:${process.env.APOLLO_SERVER_PORT}` });

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
  it('Should newUser inserted in database and graphql result be equal to input', async () => {
    const input = {
      name: 'MochaUser',
      email: 'mochauser@email.com',
      password: 'mochauserPassword1',
      birthdate: '01-01-1993',
    };

    const createdUser = (await mutationCreateUser(connection, input)).data.createUser as UserInput;
    const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: input.email });

    const isSamePassword = await comparePassword(input.password, userInDatabase.password);

    expect(userInDatabase.id).to.be.gt(0);
    expect(userInDatabase.name).to.be.eq(input.name);
    expect(userInDatabase.email).to.be.eq(input.email);
    expect(isSamePassword).to.be.true;
    expect(userInDatabase.birthdate).to.be.eq(input.birthdate);

    expect(createdUser).to.be.deep.eq({
      id: userInDatabase.id,
      name: input.name,
      email: input.email,
      birthdate: input.birthdate,
    });

    after(async () => {
      await AppDataSource.getRepository(User).delete({ email: input.email });
    });
  });

  it('Should give an error when creating a user with an already existent email', async () => {
    const input = {
      name: 'MochaUser2',
      email: 'mochauser2@email.com',
      password: 'mochauserPassword2',
      birthdate: '01-01-1995',
    };

    await mutationCreateUser(connection, input);
    const apolloErrors = (await mutationCreateUser(connection, input)).errors as ApolloErrorFormat[];
    const mailError = new ConflictError('');
    const hasDuplicatedEmailError = apolloErrors.some((error) => error.code === mailError.code);

    expect(apolloErrors.length).to.be.gt(0);
    expect(hasDuplicatedEmailError).to.be.true;

    after(async () => {
      await AppDataSource.getRepository(User).delete({ email: input.email });
    });
  });

  it('Should give an error when creating a user with an invalid password', async () => {
    const input = {
      name: 'MochaUser3',
      email: 'mochauser3@email.com',
      password: 'mochauserPassword',
      birthdate: '01-01-2000',
    };

    const apolloErrors = (await mutationCreateUser(connection, input)).errors as ApolloErrorFormat[];
    const passwordError = new BadRequestError('');
    const hasInvalidPasswordError = apolloErrors.some((error) => error.code === passwordError.code);

    expect(apolloErrors.length).to.be.gt(0);
    expect(hasInvalidPasswordError).to.be.true;
  });
});

describe('Login Mutation Test', () => {
  it('Should return be the user that has the same email from input and a token', async () => {
    const input = {
      name: 'MochaUser1',
      email: 'mochauser1@email.com',
      password: 'mochauserPassword1',
      birthdate: '01-01-2000',
    };

    await mutationCreateUser(connection, input);
    const userInDatabase = await AppDataSource.getRepository(User).findOneBy({ email: input.email });

    const loginResult = (await mutationLogin(connection, { email: input.email, password: input.password })).data.login;

    expect(loginResult.user).to.be.deep.eq({
      id: userInDatabase.id,
      name: input.name,
      email: input.email,
      birthdate: input.birthdate,
    });

    expect(loginResult.token).to.be.a('string');
    expect(loginResult.token.length).to.be.gt(0);

    after(async () => {
      await AppDataSource.getRepository(User).delete({ email: input.email });
    });
  });

  it('Should return an error when trying to login with a non-existent email', async () => {
    const apolloErrors = (
      await mutationLogin(connection, { email: 'mochauserNotExistent@email.com', password: 'SomePassword1' })
    ).errors as ApolloErrorFormat[];

    const mailNotFoundError = new NotFoundError('');
    const hasNotFoundEmailError = apolloErrors.some((error) => error.code === mailNotFoundError.code);

    expect(apolloErrors.length).to.be.gt(0);
    expect(hasNotFoundEmailError).to.be.true;
  });

  it('Should return an error when trying to login with an incorrect password', async () => {
    const input = {
      name: 'MochaUser3',
      email: 'mochauser3@email.com',
      password: 'mochauserPassword3',
      birthdate: '01-01-2000',
    };

    await mutationCreateUser(connection, input);

    const apolloErrors = (await mutationLogin(connection, { email: input.email, password: 'mochauserPassword123' }))
      .errors as ApolloErrorFormat[];

    const passwordIncorrectError = new UnauthorizedError('');
    const hasPasswordIncorrectError = apolloErrors.some((error) => error.code === passwordIncorrectError.code);

    expect(apolloErrors.length).to.be.gt(0);
    expect(hasPasswordIncorrectError).to.be.true;

    after(async () => {
      await AppDataSource.getRepository(User).delete({ email: input.email });
    });
  });
});
