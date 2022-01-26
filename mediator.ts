import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { Request } from "./request.ts";
import {
  AnyType,
  Constructor,
  Handler,
  NotificationConstructor,
  NotificationHandler,
  RequestConstructor,
  RequestHandler,
  Response,
} from "./types.ts";

interface MediatorConfig {
  publishStratey?: PublishStrategy;
}

export class Mediator {
  #notificationHandlers: Record<
    symbol,
    Array<NotificationHandler<Notification>>
  > = {};
  #requestHandlers: Record<symbol, RequestHandler> = {};
  #publishStrategy: PublishStrategy;

  constructor(config?: MediatorConfig) {
    this.#publishStrategy = config?.publishStratey ?? PublishStrategy.Async;
  }

  public handle<TRequest extends (Request<AnyType> | Notification)>(
    constructor: Constructor<TRequest>,
    handler: Handler<TRequest>,
  ): void {
    if (
      this.isRequestConstructor(constructor)
    ) {
      const { name, requestTypeId } = constructor;

      if (requestTypeId in this.#requestHandlers) {
        throw new Error(`Handler for ${name} already exists`);
      }

      this.#requestHandlers = {
        ...this.#requestHandlers,
        [requestTypeId]: handler,
      };

      return;
    }

    if (this.isNotificationConstructor(constructor)) {
      const { notificationTypeId } = constructor;
      this.#notificationHandlers = {
        ...this.#notificationHandlers,
        [notificationTypeId]: [
          ...(this.#notificationHandlers[notificationTypeId] ?? []),
          handler as NotificationHandler<Notification>,
        ],
      };
      return;
    }

    throw new Error(`Invalid request or notification`);
  }

  public async publish<TNotification extends Notification>(
    notificaiton: TNotification,
    publishStrategy?: PublishStrategy,
  ): Promise<void> {
    const { constructor } = notificaiton;

    if (!this.isNotificationConstructor(constructor)) {
      throw new Error(`No handler found for notification, ${constructor.name}`);
    }

    const handlers =
      this.#notificationHandlers[constructor.notificationTypeId] ?? [];

    const aggregateErrors: Error[] = [];
    switch (publishStrategy ?? this.#publishStrategy) {
      case PublishStrategy.ParallelNoWait:
        handlers.forEach((handler) => handler(notificaiton));
        break;
      case PublishStrategy.ParallelWhenAny:
        await Promise.any(handlers.map((handler) => handler(notificaiton)));
        break;
      case PublishStrategy.ParallelWhenAll:
      case PublishStrategy.Async:
        await Promise.all(handlers.map((handler) => handler(notificaiton)));
        break;
      case PublishStrategy.SyncContinueOnException:
        for (const handler of handlers) {
          try {
            await handler(notificaiton);
          } catch (error) {
            aggregateErrors.push(error);
          }
        }

        if (aggregateErrors.length > 0) {
          throw new AggregateError(aggregateErrors);
        }

        break;
      case PublishStrategy.SyncStopOnException:
        for (const handler of handlers) {
          await handler(notificaiton);
        }
        break;
      default:
        throw new Error(`Invalid publish strategy`);
    }
  }

  public send<TRequest extends Request>(
    requestOrNotification: TRequest,
  ): Response<TRequest> {
    if (
      requestOrNotification instanceof Request &&
      this.isRequestConstructor(requestOrNotification.constructor)
    ) {
      const { name, requestTypeId } = requestOrNotification.constructor;

      if (!(requestTypeId in this.#requestHandlers)) {
        throw new Error(`No handler found for request, ${name}`);
      }

      const handler = this.#requestHandlers[requestTypeId];

      return handler(requestOrNotification);
    }

    throw new Error(`Invalid request`);
  }

  private isNotificationConstructor<TNotification extends Notification>(
    constructor: AnyType,
  ): constructor is NotificationConstructor<TNotification> {
    return (
      constructor.notificationTypeId != null &&
      typeof constructor.notificationTypeId === "symbol"
    );
  }

  private isRequestConstructor<TRequest extends Request>(
    constructor: AnyType,
  ): constructor is RequestConstructor<TRequest> {
    return (
      constructor.requestTypeId != null &&
      typeof constructor.requestTypeId === "symbol"
    );
  }
}
