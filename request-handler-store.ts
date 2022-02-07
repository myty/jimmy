import { Request } from "./request.ts";
import { TypeGuards } from "./type-guards.ts";
import { RequestConstructor, RequestHandler } from "./types.ts";

export class RequestHandlerStore {
  private _handlers: Record<symbol, RequestHandler> = {};

  public add<TRequest extends Request>(
    constructor: RequestConstructor<TRequest>,
    handler: RequestHandler<TRequest>,
  ) {
    const { name, requestTypeId } = constructor;

    if (requestTypeId in this._handlers) {
      throw new Error(`Handler for ${name} already exists`);
    }

    this._handlers = {
      ...this._handlers,
      [requestTypeId]: handler as RequestHandler,
    };
  }

  public get<TRequest extends Request>(
    request: TRequest,
  ): RequestHandler<TRequest> {
    if (!TypeGuards.isRequest(request)) {
      throw new Error(`Not a valid request type`);
    }

    const { name, requestTypeId } = request.constructor;

    if (!(requestTypeId in this._handlers)) {
      throw new Error(`No handler found for request, ${name}`);
    }

    return this._handlers[requestTypeId];
  }
}
