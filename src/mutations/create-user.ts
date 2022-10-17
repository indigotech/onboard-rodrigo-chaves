import { ContextReturn } from '../apollo-context/context';
import { AppDataSource } from '../data-source';
import { encryptPassword } from '../encryptPassword';
import { User } from '../entity/User';
import { errorMessages } from '../errors/error-messages';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { UserInput } from '../inputs/user-input';
import { validateInputs } from '../inputs/validate-user-input';

export async function createUser(parent: any, args: { input: UserInput }, context: ContextReturn) {
  if (!context.userId) {
    throw new UnauthorizedError(errorMessages.notAuthenticated);
  }

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
