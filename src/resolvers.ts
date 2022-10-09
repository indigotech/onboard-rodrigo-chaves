import { User } from './entity/User';
import { AppDataSource } from './data-source';
import { comparePassword, encryptPassword } from './encryptPassword';
import { ConflictError } from './errors/conflict.error';
import { BadRequestError } from './errors/bad-request.error';

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthdate: string;
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

async function login(parent: any, args: { email: string; password: string }) {
  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email: args.email });

  if (!existentUser) {
    throw new Error(`Email: '${args.email}' does not exist.`);
  }

  if (!(await comparePassword(args.password, existentUser.password))) {
    throw new Error(`Password incorrect.`);
  }

  return { user: existentUser, token: 'the_token' };
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
