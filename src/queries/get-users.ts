import { ContextReturn } from '../apollo-context/context';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { BadRequestError } from '../errors/bad-request.error';
import { errorMessages } from '../errors/error-messages';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { UsersPage } from './users-page-type';

export const DEFAULT_LIMIT = 5;

export async function getUsers(parent: any, args: { limit?: number; index?: number }, context: ContextReturn) {
  if (!context.userId) {
    throw new UnauthorizedError(errorMessages.notAuthenticated);
  }

  if (args.limit <= 0) {
    throw new BadRequestError(errorMessages.invalidLimit);
  }

  const limit = args.limit ?? DEFAULT_LIMIT;
  const index = args.index ? args.index : 1;

  const usersCount = await AppDataSource.manager.getRepository(User).count();
  const maxIndex = Math.ceil(usersCount / limit);

  if (index > maxIndex) {
    throw new BadRequestError(errorMessages.indexInvalid);
  }

  const skip = (index - 1) * limit;

  const usersList = await AppDataSource.manager.getRepository(User).find({
    skip: 0,
    take: limit,
    order: {
      name: 'ASC',
    },
  });

  const after = usersCount - skip - limit;

  const response = {
    total: usersCount,
    before: skip,
    after: after < 0 ? 0 : after,
    users: usersList,
  } as UsersPage;

  return response;
}
