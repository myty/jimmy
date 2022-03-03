import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { Request } from "./request.ts";
import { RequestHandlerStore } from "./request-handler-store.ts";
import { NotificationHandlerStore } from "./notification-handler-store.ts";
import {
  AnyType,
  Constructor,
  Handler,
  NotificationHandler,
  Response,
} from "./types.ts";
import { IPublisher, PublisherFactory } from "./publisher-factory.ts";
import { TypeGuards } from "./type-guards.ts";

interface MediatorConfig {
  publishStratey?: PublishStrategy;
}

export class Mediator {
  private _notificationHandlers: NotificationHandlerStore;
  private _requestHandlers: RequestHandlerStore;
  private _publishStrategy: IPublisher;

  constructor(config?: MediatorConfig) {
    this._publishStrategy = PublisherFactory.create(
      config?.publishStratey ??
        PublishStrategy.SyncContinueOnException,
    );
    this._notificationHandlers = new NotificationHandlerStore();
    this._requestHandlers = new RequestHandlerStore();

    this.handle = this.handle.bind(this);
    this.publish = this.publish.bind(this);
    this.send = this.send.bind(this);
  }

  public handle<TRequest extends (Request<AnyType> | Notification)>(
    constructor: Constructor<TRequest>,
    handler: Handler<TRequest>,
  ): void {
    if (TypeGuards.isRequestConstructor(constructor)) {
      this._requestHandlers.add(constructor, handler);
      return;
    }

    if (TypeGuards.isNotificationConstructor(constructor)) {
      this._notificationHandlers.add(
        constructor,
        handler as NotificationHandler,
      );
      return;
    }

    throw new Error(`Invalid request or notification`);
  }

  public async publish<TNotification extends Notification>(
    notification: TNotification,
    publishStrategy?: PublishStrategy,
  ): Promise<void> {
    const publisher = publishStrategy != null
      ? PublisherFactory.create(publishStrategy)
      : this._publishStrategy;

    if (!TypeGuards.isNotification(notification)) {
      throw new Error(
        `No handler found for notification, ${notification.constructor.name}`,
      );
    }

    await publisher.publish(
      notification,
      this._notificationHandlers.get(notification),
    );
  }

  public send<TRequest extends Request>(
    request: TRequest,
  ): Response<TRequest> {
    if (TypeGuards.isRequest<TRequest>(request)) {
      const handler = this._requestHandlers.get<TRequest>(request);
      return handler(request);
    }

    throw new Error(`Invalid request`);
  }
}
