import { ContextReturn } from '../apollo-context/context';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { BadRequestError } from '../errors/bad-request.error';
import { errorMessages } from '../errors/error-messages';
import { UnauthorizedError } from '../errors/unauthorized.error';

export const DEFAULT_LIMIT = 5;

export async function getUsers(parent: any, args: { limit?: number }, context: ContextReturn) {
  if (!context.userId) {
    throw new UnauthorizedError(errorMessages.notAuthenticated);
  }

  if (args.limit <= 0) {
    throw new BadRequestError(errorMessages.invalidLimit);
  }

  const usersList = await AppDataSource.manager.getRepository(User).find({
    skip: 0,
    take: args.limit ?? DEFAULT_LIMIT,
    order: {
      name: 'ASC',
    },
  });

  return usersList;
}
