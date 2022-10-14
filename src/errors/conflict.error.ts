import { BackEndError } from './backed-end.error';

export class ConflictError extends BackEndError {
  constructor(message: string) {
    super(message, 409);
  }
}
