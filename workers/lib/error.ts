export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly detail?: string;

  constructor(statusCode: number, statusText: string, detail?: string) {
    super(`HttpError while ${detail ?? ''}: (${statusCode}) ${statusText}`);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.detail = detail;
    this.name = 'HttpError';
  }
}
