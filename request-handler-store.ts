import { Request } from "./request.ts";
import { TypeGuards } from "./type-guards.ts";
import { RequestConstructor, RequestHandler } from "./types.ts";

export class RequestHandlerStore {
  private readonly _handlers: Map<symbol, RequestHandler>;

  constructor() {
    this._handlers = new Map();

    this.add = this.add.bind(this);
    this.get = this.get.bind(this);
    this.remove = this.remove.bind(this);
  }

  public add<TRequest extends Request>(
    constructor: RequestConstructor<TRequest>,
    handler: RequestHandler<TRequest>,
  ) {
    const { name, requestTypeId } = constructor;

    if (this._handlers.has(requestTypeId)) {
      throw new Error(`Handler for ${name} already exists`);
    }

    this._handlers.set(
      requestTypeId,
      handler as RequestHandler,
    );
  }

  public get<TRequest extends Request>(
    request: TRequest,
  ): RequestHandler<TRequest> {
    if (!TypeGuards.isRequest(request)) {
      throw new Error(`Not a valid request type`);
    }

    const { name, requestTypeId } = request.constructor;
    const foundHandler = this._handlers.get(requestTypeId);

    if (foundHandler == null) {
      throw new Error(`No handler found for request, ${name}`);
    }

    return foundHandler;
  }

  public remove<TRequest extends Request>(
    constructor: RequestConstructor<TRequest>,
    handler: RequestHandler<TRequest>,
  ): void {
    const { name, requestTypeId } = constructor;
    const foundHandler = this._handlers.get(requestTypeId);

    if (foundHandler !== handler) {
      throw new Error(`No handler found for request, ${name}`);
    }

    if (!this._handlers.delete(requestTypeId)) {
      throw new Error(`Could not remove handler for request, ${name}`);
    }
  }
}
