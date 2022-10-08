import { ApolloError } from 'apollo-server-errors';

export class PasswordInvalidError extends ApolloError {
  constructor(message: string) {
    super(message, '400');
  }
}
