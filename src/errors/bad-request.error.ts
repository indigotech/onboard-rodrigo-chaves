export class BadRequestError extends Error {
  public details?: string;
  public readonly code: number;

  constructor(message: string) {
    super(message);
    this.code = 400;
  }
}
