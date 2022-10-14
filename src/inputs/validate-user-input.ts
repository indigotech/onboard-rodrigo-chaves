import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { BadRequestError } from '../errors/bad-request.error';
import { ConflictError } from '../errors/conflict.error';
import { errorMessages } from '../errors/error-messages';
import { UserInput } from './user-input';

export async function validateInputs(args: { input: UserInput }) {
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

  if (!passwordRegex.test(args.input.password)) {
    throw new BadRequestError(errorMessages.passwordInvalid);
  }

  const existentUser = await AppDataSource.manager.getRepository(User).findOneBy({ email: args.input.email });

  if (existentUser) {
    throw new ConflictError(errorMessages.duplicatedEmail);
  }
}
