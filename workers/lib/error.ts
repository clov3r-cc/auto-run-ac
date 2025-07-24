export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;
  public readonly detail?: string;
  public readonly body?: string;

  constructor(
    statusCode: number,
    statusText: string,
    detail?: string,
    body?: unknown,
  ) {
    super(`HttpError while ${detail ?? ''}: (${statusCode}) ${statusText}`);
    this.statusCode = statusCode;
    this.statusText = statusText;
    this.detail = detail;
    this.body = JSON.stringify(body);
    this.name = 'HttpError';
  }
}
