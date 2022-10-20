import { ContextReturn } from '../apollo-context/context';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { BadRequestError } from '../errors/bad-request.error';
import { errorMessages } from '../errors/error-messages';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { PaginationInput } from '../inputs/pagination-input';
import { UsersPaginated } from './users-paginated-type';

export const DEFAULT_LIMIT = 5;

export async function getUsers(parent: any, args: { input: PaginationInput }, context: ContextReturn) {
  if (!context.userId) {
    throw new UnauthorizedError(errorMessages.notAuthenticated);
  }

  const limit = args.input.limit ?? DEFAULT_LIMIT;
  const offset = args.input.offset ?? 0;

  if (limit <= 0) {
    throw new BadRequestError(errorMessages.invalidLimit);
  }

  if (offset < 0) {
    throw new BadRequestError(errorMessages.invalidOffset);
  }

  const usersCount = await AppDataSource.manager.getRepository(User).count();
  let skip = offset * limit;

  if (skip >= usersCount) {
    skip = 0;
  }

  const users = await AppDataSource.manager.getRepository(User).find({
    skip,
    take: limit,
    order: {
      name: 'ASC',
    },
  });

  const after = usersCount - skip - limit;

  const response: UsersPaginated = {
    total: usersCount,
    before: skip,
    after: after < 0 ? 0 : after,
    users,
  };

  return response;
}
