import { BackEndError } from './backed-end.error';

export class NotFoundError extends BackEndError {
  constructor(message: string) {
    super(message, 404);
  }
}
