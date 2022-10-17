import { GraphQLError } from 'graphql';
import { errorMessages } from '../errors/error-messages';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { verifyToken } from '../jwt-utils';

export interface ContextReturn {
  userId: string;
}

export function context({ req }): ContextReturn {
  let userId: string;
  const token = req.headers.authorization;

  if (token) {
    try {
      userId = verifyToken(token);
    } catch (error) {
      const originalError = new UnauthorizedError(errorMessages.notAuthenticated);

      throw new GraphQLError(errorMessages.tokenInvalidOrExpired, { originalError });
    }
  }

  return { userId };
}
