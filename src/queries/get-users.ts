import { ContextReturn } from '../apollo-context/context';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { BadRequestError } from '../errors/bad-request.error';
import { errorMessages } from '../errors/error-messages';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { UsersPage } from './users-page-type';

export const DEFAULT_LIMIT = 5;

export async function getUsers(parent: any, args: { limit?: number; offset?: number }, context: ContextReturn) {
  if (!context.userId) {
    throw new UnauthorizedError(errorMessages.notAuthenticated);
  }

  const limit = args.limit ?? DEFAULT_LIMIT;

  if (limit <= 0) {
    throw new BadRequestError(errorMessages.invalidLimit);
  }

  const offset = args.offset ?? 0;

  const usersCount = await AppDataSource.manager.getRepository(User).count();
  const maxOffset = Math.ceil(usersCount / limit);

  const skip = offset * limit;
  const take = offset < 0 || offset > maxOffset ? 0 : limit;

  const usersList = await AppDataSource.manager.getRepository(User).find({
    skip,
    take,
    order: {
      name: 'ASC',
    },
  });

  const after = usersCount - skip - limit;

  const response: UsersPage = {
    total: usersCount,
    before: skip,
    after: after < 0 ? 0 : after,
    users: usersList,
  };

  return response;
}
