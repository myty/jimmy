import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { Request } from "./request.ts";
import { RequestHandlerStore } from "./request-handler-store.ts";
import { NotificationHandlerStore } from "./notification-handler-store.ts";
import {
  Constructor,
  Handler,
  HandlerDefinition,
  NotificationHandler,
  RequestOrNotification,
  Response,
} from "./types.ts";
import { IPublisher, PublisherFactory } from "./publisher-factory.ts";
import { TypeGuards } from "./type-guards.ts";

interface MediatorConfig {
  publishStratey?: PublishStrategy;
  handlerDefinitions?: HandlerDefinition[];
}

/**
 * Main mediator class that handles requests and notifications
 */
class Mediator {
  #notificationHandlers: NotificationHandlerStore =
    new NotificationHandlerStore();
  #requestHandlers: RequestHandlerStore = new RequestHandlerStore();
  #publishStrategy: IPublisher;

  constructor(config?: MediatorConfig) {
    this.#publishStrategy = PublisherFactory.create(
      config?.publishStratey ??
        PublishStrategy.SyncContinueOnException,
    );

    if (config?.handlerDefinitions != null) {
      config.handlerDefinitions.forEach(({ type, handle }) => {
        this.handle<RequestOrNotification>(type, handle);
      });
    }
  }

  /**
   * Register a request or notification handler
   */
  public handle<THandler extends RequestOrNotification>(
    constructor: Constructor<THandler>,
    handler: Handler<THandler>,
  ): void {
    if (TypeGuards.isRequestConstructor(constructor)) {
      this.#requestHandlers.add(constructor, handler);
      return;
    }

    if (TypeGuards.isNotificationConstructor(constructor)) {
      this.#notificationHandlers.add(
        constructor,
        handler as NotificationHandler,
      );
      return;
    }

    throw new Error(`Invalid request or notification`);
  }

  /**
   * Publish a notification
   */
  public async publish<TNotification extends Notification>(
    notification: TNotification,
    publishStrategy?: PublishStrategy,
  ): Promise<void> {
    const publisher = publishStrategy != null
      ? PublisherFactory.create(publishStrategy)
      : this.#publishStrategy;

    if (!TypeGuards.isNotification(notification)) {
      throw new Error(
        `No handler found for notification, ${notification.constructor.name}`,
      );
    }

    await publisher.publish(
      notification,
      this.#notificationHandlers.get(notification),
    );
  }

  /**
   * Send a request
   */
  public send<TRequest extends Request>(
    request: TRequest,
  ): Response<TRequest> {
    if (TypeGuards.isRequest<TRequest>(request)) {
      const handler = this.#requestHandlers.get<TRequest>(request);
      return handler(request);
    }

    throw new Error(`Invalid request`);
  }
}

export { Mediator };
