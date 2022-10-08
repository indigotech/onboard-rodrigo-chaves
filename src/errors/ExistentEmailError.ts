import { ApolloError } from 'apollo-server-errors';

export class ExistentEmailError extends ApolloError {
  constructor(message: string) {
    super(message, '409');
  }
}
