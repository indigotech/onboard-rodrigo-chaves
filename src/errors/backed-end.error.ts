export class BackEndError extends Error {
  public details?: string;
  public readonly code: number;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code ? code : 500;
  }
}
