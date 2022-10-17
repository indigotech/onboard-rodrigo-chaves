import { AppDataSource } from '../data-source';
import { comparePassword } from '../encryptPassword';
import { User } from '../entity/User';
import { errorMessages } from '../errors/error-messages';
import { NotFoundError } from '../errors/not-found.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { LoginInput } from '../inputs/login-input';
import { generateToken } from '../jwt-utils';

export async function login(parent: any, args: { input: LoginInput }) {
  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email: args.input.email });

  if (!existentUser) {
    throw new NotFoundError(errorMessages.emailNotFound);
  }

  if (!(await comparePassword(args.input.password, existentUser.password))) {
    throw new UnauthorizedError(errorMessages.passwordIncorrect);
  }

  const token = generateToken(String(existentUser.id), args.input.rememberMe);

  return { user: existentUser, token };
}
