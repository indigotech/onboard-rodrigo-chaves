import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { errorMessages } from '../errors/error-messages';
import { NotFoundError } from '../errors/not-found.error';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { ContextReturn } from '../apollo-context/context';

export async function getUser(parent: any, args: { id: number }, context: ContextReturn) {
  if (!context.userId) {
    throw new UnauthorizedError(errorMessages.notAuthenticated);
  }

  const existentUser = await AppDataSource.getRepository(User).findOne({
    where: { id: args.id },
    relations: { addresses: true },
  });

  if (!existentUser) {
    throw new NotFoundError(errorMessages.userNotFound);
  }

  return existentUser;
}
