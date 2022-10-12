import { User } from './entity/User';
import { AppDataSource } from './data-source';
import { comparePassword, encryptPassword } from './encryptPassword';
import { ConflictError } from './errors/conflict.error';
import { BadRequestError } from './errors/bad-request.error';
import { NotFoundError } from './errors/not-found.error';
import { UnauthorizedError } from './errors/unauthorized.error';
import { generateToken } from './jwt-utils';

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthdate: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

async function validateInputs(email: string, password: string) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!passwordRegex.test(password)) {
    throw new BadRequestError('Password must be at least 6 characters long, have at least 1 letter and 1 digit.');
  }

  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email });

  if (existentUser) {
    throw new ConflictError(`There is already a user registered with this email: ${email}.`);
  }
}

async function login(parent: any, args: { input: LoginInput }) {
  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email: args.input.email });

  if (!existentUser) {
    throw new NotFoundError(`Email: '${args.input.email}' does not exist.`);
  }

  if (!(await comparePassword(args.input.password, existentUser.password))) {
    throw new UnauthorizedError(`Password incorrect.`);
  }

  return { user: existentUser, token: generateToken(existentUser, args.input.rememberMe) };
}

async function createUser(parent: any, args: { input: UserInput }) {
  await validateInputs(args.input.email, args.input.password);

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
