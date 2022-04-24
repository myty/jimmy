import { RequestHandler } from "./types.ts";

// deno-lint-ignore no-explicit-any
export abstract class Request<TResponse = any> {
  private static _requestTypeId: symbol;

  static get requestTypeId() {
    if (
      !Object.getOwnPropertyDescriptor(this, "_requestTypeId") ||
      this._requestTypeId == null
    ) {
      Object.defineProperty(this, "_requestTypeId", {
        value: Symbol(`Request-${this.name}`),
      });
    }

    return this._requestTypeId;
  }

  getResponse<TRequest extends Request>(
    this: TRequest,
    handler: RequestHandler<TRequest>,
  ): TResponse {
    return handler(this);
  }
}
