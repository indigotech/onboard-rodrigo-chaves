import { User } from './entity/User';
import { AppDataSource } from './data-source';
import { encryptPassword } from './encryptPassword';
<<<<<<< HEAD
import { ExistentEmailError } from './errors/ExistentEmailError';
import { PasswordInvalidError } from './errors/PasswordInvalidError';

export interface UserInput {
=======

interface UserInput {
>>>>>>> 486504a (Added error handling in ApolloServer setup, also new tests considering these errors.)
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

function login(parent: any, args: { input: { email: string; password: string } }) {
  const loggedUser = new User();

  Object.assign(loggedUser, {
    id: 12,
    name: 'Rodrigo',
    email: 'rodrigo@email.com',
    birthdate: '01-01-1980',
  });

  return { user: loggedUser, token: 'the_token' };
}

async function validateInputs(args: { input: UserInput }) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!passwordRegex.test(args.input.password)) {
<<<<<<< HEAD
    throw new PasswordInvalidError('Password must be at least 6 characters long, have at least 1 letter and 1 digit.');
  }

  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email: args.input.email });

  if (existentUser) {
    throw new ExistentEmailError(`There is already a user registered with this email: ${args.input.email}.`);
=======
    throw new Error('Password must be at least 6 characters long, have at least 1 letter and 1 digit.');
  }

  const existentUser = await AppDataSource.manager.getRepository('user').findOneBy({ email: args.input.email });

  if (existentUser) {
    throw new Error(`There is already a user registered with this email: ${args.input.email}.`);
>>>>>>> 486504a (Added error handling in ApolloServer setup, also new tests considering these errors.)
  }
}

async function createUser(parent: any, args: { input: UserInput }) {
  await validateInputs(args);

  const newUser = new User();

  Object.assign(newUser, {
    name: args.input.name,
    email: args.input.email,
    password: await encryptPassword(args.input.password),
    birthdate: args.input.birthdate,
  });

  await AppDataSource.manager.save(newUser);

  return newUser;
}

function getUsers() {
<<<<<<< HEAD
  return AppDataSource.manager.getRepository(User).find();
=======
  return AppDataSource.manager.getRepository('user').find();
>>>>>>> 486504a (Added error handling in ApolloServer setup, also new tests considering these errors.)
}

export const resolvers = {
  Query: {
    users: getUsers,
  },
  Mutation: {
    createUser,
    login,
  },
};
