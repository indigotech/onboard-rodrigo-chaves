import { User } from './entity/User';
import { AppDataSource } from './data-source';
import { encryptPassword } from './encryptPassword';
import { ConflictError } from './errors/conflict.error';
import { BadRequestError } from './errors/bad-request.error';

export interface UserInput {
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
    throw new BadRequestError('Password must be at least 6 characters long, have at least 1 letter and 1 digit.');
  }

  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email: args.input.email });

  if (existentUser) {
    throw new ConflictError(`There is already a user registered with this email: ${args.input.email}.`);
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
  return AppDataSource.manager.getRepository(User).find();
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
