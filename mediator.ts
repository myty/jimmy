import { Notification } from "./notification.ts";
import { Request } from "./request.ts";
import {
  AnyType,
  NotificationConstructor,
  NotificationHandler,
  RequestConstructor,
  RequestHandler,
  Response,
} from "./types.ts";

export class Mediator {
  #notificationHandlers: Record<
    symbol,
    Array<NotificationHandler<Notification>>
  > = {};
  #requestHandlers: Record<symbol, RequestHandler<Request<AnyType>>> = {};

  handle<TRequest extends Request<TResponse>, TResponse>(
    { name, requestTypeId }: RequestConstructor<TRequest>,
    handler: RequestHandler<TRequest>,
  ): void {
    if (requestTypeId in this.#requestHandlers) {
      throw new Error(`Handler for ${name} already exists`);
    }

    this.#requestHandlers = {
      ...this.#requestHandlers,
      [requestTypeId]: handler as RequestHandler<Request<AnyType>>,
    };
  }

  notification<TNotification extends Notification>(
    { notificationTypeId }: NotificationConstructor<TNotification>,
    handler: NotificationHandler<TNotification>,
  ): void {
    this.#notificationHandlers = {
      ...this.#notificationHandlers,
      [notificationTypeId]: [
        ...(this.#notificationHandlers[notificationTypeId] ?? []),
        handler as NotificationHandler<Notification>,
      ],
    };
  }

  async publish<TNotification extends Notification>(
    notificaiton: TNotification,
  ): Promise<void> {
    const { constructor } = notificaiton;
    const { name, notificationTypeId } =
      isNotificationConstructor<TNotification>(constructor)
        ? constructor
        : { name: undefined, notificationTypeId: undefined };

    if (
      notificationTypeId == null ||
      !(notificationTypeId in this.#notificationHandlers)
    ) {
      throw new Error(`No handler found for notification, ${name}`);
    }

    const handlers = this.#notificationHandlers[notificationTypeId];

    await Promise.all(handlers);
  }

  send<TRequest extends Request>(request: TRequest): Response<TRequest> {
    const { constructor } = request;
    const { name, requestTypeId } = isRequestConstructor<TRequest>(constructor)
      ? constructor
      : { name: undefined, requestTypeId: undefined };

    if (requestTypeId == null || !(requestTypeId in this.#requestHandlers)) {
      throw new Error(`No handler found for request, ${name}`);
    }

    const handler = this.#requestHandlers[requestTypeId];

    return handler(request);
  }
}

function isNotificationConstructor<TNotification extends Notification>(
  constructor: AnyType,
): constructor is NotificationConstructor<TNotification> {
  return (
    constructor.notificationTypeId != null &&
    typeof constructor.notificationTypeId === "symbol"
  );
}

function isRequestConstructor<TRequest extends Request>(
  constructor: AnyType,
): constructor is RequestConstructor<TRequest> {
  return (
    constructor.requestTypeId != null &&
    typeof constructor.requestTypeId === "symbol"
  );
}
