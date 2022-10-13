import * as dotenv from 'dotenv';
dotenv.config({ path: `${process.cwd()}/test.env` });

import axios from 'axios';
import { expect } from 'chai';
import { initApolloServer } from '../src/apollo-server';
import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import { comparePassword } from '../src/encryptPassword';
import { mutationCreateUser, queryUser } from './queries';
import { ConflictError } from '../src/errors/conflict.error';
import { BadRequestError } from '../src/errors/bad-request.error';
import { UserInput } from '../src/inputs/user-input';
import { errorMessages } from '../src/errors/error-messages';

interface ApolloErrorFormat {
  message: string;
  code: number;
  details: string;
}

interface ApolloErrorFormat {
  message: string;
  extensions: { code: string };
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

    expect(isSamePassword).to.be.true;
    expect(userInDatabase.id).to.be.gt(0);
    expect(userInDatabase.name).to.be.eq(input.name);
    expect(userInDatabase.email).to.be.eq(input.email);
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
    const duplicatedEmailError = apolloErrors.find(
      (error) => error.code === mailError.code && error.message === errorMessages.duplicatedEmail,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(duplicatedEmailError).to.be.deep.eq({
      code: mailError.code,
      details: '',
      message: errorMessages.duplicatedEmail,
    });

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
    const invalidPasswordError = apolloErrors.find(
      (error) => error.code === passwordError.code && error.message === errorMessages.passwordInvalid,
    );

    expect(apolloErrors.length).to.be.gt(0);
    expect(invalidPasswordError).to.be.deep.eq({
      code: passwordError.code,
      details: '',
      message: errorMessages.passwordInvalid,
    });
  });
});

//Temporary test for login, it compares to a specific return, it will be changed in the next PR's.
describe('Login Mutation test - Return', () => {
  it('Should return be equal input', async () => {
    const query = `mutation($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        user {
          id
          name
          email
          birthdate
        },
        token
      }
    }`;

    const email = 'mochauser@email.com';
    const password = 'mochauserPassword1';

    const result = await connection.post('/graphql', {
      query,
      variables: { email, password },
    });

    const loginResponse = {
      id: 12,
      name: 'Rodrigo',
      email: 'rodrigo@email.com',
      birthdate: '01-01-1980',
    };

    expect(JSON.stringify(result.data.data.login.user)).to.be.equal(JSON.stringify(loginResponse));
  });
});
