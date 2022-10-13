import { BackEndError } from './backed-end.error';

export class BadRequestError extends BackEndError {
  constructor(message: string) {
    super(message, 400);
  }
}
