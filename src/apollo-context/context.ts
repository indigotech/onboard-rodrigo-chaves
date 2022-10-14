import { GraphQLError } from 'graphql';
import { errorMessages } from '../errors/error-messages';
import { UnauthorizedError } from '../errors/unauthorized.error';
import { verifyToken } from '../jwt-utils';

export function context({ req }) {
  let userId = '';
  const token = req.headers.authorization;

  if (token) {
    try {
      userId = verifyToken(token);
    } catch (error) {
      throw new GraphQLError(errorMessages.tokenInvalidOrExpired, {
        originalError: new UnauthorizedError(errorMessages.notAuthenticated),
      });
    }
  }

  return userId;
}
