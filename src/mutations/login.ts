import { AppDataSource } from '../data-source';
import { comparePassword } from '../encryptPassword';
import { User } from '../entity/User';
import { errorMessages } from '../errors/error-messages';
import { NotFoundError } from '../errors/not-found.error';
import { UnauthorizedError } from '../errors/unauthorized.error';

export async function login(parent: any, args: { email: string; password: string }) {
  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email: args.email });

  if (!existentUser) {
    throw new NotFoundError(errorMessages.emailNotFound);
  }

  if (!(await comparePassword(args.password, existentUser.password))) {
    throw new UnauthorizedError(errorMessages.passwordIncorrect);
  }

  return { user: existentUser, token: 'the_token' };
}
