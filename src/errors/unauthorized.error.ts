import { BackEndError } from './backed-end.error';

export class UnauthorizedError extends BackEndError {
  constructor(message: string) {
    super(message, 401);
  }
}
