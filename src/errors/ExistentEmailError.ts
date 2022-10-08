<<<<<<< HEAD
export class ExistentEmailError extends Error {
  public details?: string;
  public readonly code: number;

  constructor(message: string) {
    super(message);
    this.code = 409;
=======
import { ApolloError } from 'apollo-server-errors';

export class ExistentEmailError extends ApolloError {
  constructor(message: string) {
    super(message, '409');
>>>>>>> 486504a (Added error handling in ApolloServer setup, also new tests considering these errors.)
  }
}
