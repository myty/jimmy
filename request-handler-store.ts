import { Request } from "./request.ts";
import { TypeGuards } from "./type-guards.ts";
import {
  Constructor,
  Handler,
  HandlerStore,
  RequestHandler,
  RequestOrNotificationClass,
} from "./types.ts";

export class RequestHandlerStore implements HandlerStore<Request> {
  private readonly _handlers: Map<symbol, RequestHandler>;

  constructor() {
    this._handlers = new Map();

    this.add = this.add.bind(this);
    this.get = this.get.bind(this);
    this.remove = this.remove.bind(this);
  }

  public add<TRequest extends Request>(
    constructor: Constructor<TRequest>,
    handler: RequestHandler<TRequest>,
  ) {
    if (
      !(TypeGuards.isRequestType(constructor) &&
        TypeGuards.isRequestHandler(constructor, handler))
    ) {
      throw new Error(`Not a valid request type`);
    }

    const { name, requestTypeId } = constructor;

    if (this._handlers.has(requestTypeId)) {
      throw new Error(`Handler for ${name} already exists`);
    }

    this._handlers.set(
      requestTypeId,
      handler,
    );
  }

  public get<TRequest extends Request>(
    request: TRequest,
  ): RequestHandler<TRequest> {
    if (!TypeGuards.isRequest(request)) {
      throw new Error(`Not a valid request type`);
    }

    const { name, requestTypeId } = request.constructor;
    const foundHandler = this._handlers.get(requestTypeId) as
      | RequestHandler<TRequest>
      | undefined;

    if (foundHandler == null) {
      throw new Error(`No handler found for request, ${name}`);
    }

    return foundHandler;
  }

  public getMany<TRequest extends Request>(
    _value: TRequest,
  ): Array<RequestHandler<TRequest>> {
    throw new Error("Method not implemented.");
  }

  public remove<TRequest extends Request>(
    constructor: Constructor<TRequest>,
    handler: RequestHandler<TRequest>,
  ): void {
    if (
      !(TypeGuards.isRequestType(constructor) &&
        TypeGuards.isRequestHandler(constructor, handler))
    ) {
      throw new Error(`Not a valid request type`);
    }

    const { name, requestTypeId } = constructor;

    if (!this._handlers.delete(requestTypeId)) {
      throw new Error(`No handler found for request, ${name}`);
    }
  }
}
