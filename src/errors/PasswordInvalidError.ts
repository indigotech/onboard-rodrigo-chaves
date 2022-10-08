<<<<<<< HEAD
export class PasswordInvalidError extends Error {
  public details?: string;
  public readonly code: number;

  constructor(message: string) {
    super(message);
    this.code = 400;
=======
import { ApolloError } from 'apollo-server-errors';

export class PasswordInvalidError extends ApolloError {
  constructor(message: string) {
    super(message, '400');
>>>>>>> 486504a (Added error handling in ApolloServer setup, also new tests considering these errors.)
  }
}
