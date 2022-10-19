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

  if (limit <= 0) {
    throw new BadRequestError(errorMessages.invalidLimit);
  }

  const usersCount = await AppDataSource.manager.getRepository(User).count();
  const maxOffset = Math.ceil(usersCount / limit);

  const offset = args.input.offset ?? 0;

  const skip = offset * limit;
  const take = offset < 0 || offset >= maxOffset ? 0.1 : limit;

  const users = await AppDataSource.manager.getRepository(User).find({
    skip: skip < 0 ? 0 : skip,
    take,
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
