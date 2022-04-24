import { Notification } from "./notification.ts";
import { TypeGuards } from "./type-guards.ts";
import {
  Constructor,
  Handler,
  HandlerStore,
  NotificationHandler,
} from "./types.ts";

export class NotificationHandlerStore implements HandlerStore<Notification> {
  private readonly _handlers: Map<symbol, Array<NotificationHandler>> =
    new Map();

  public add<T extends Notification>(
    constructor: Constructor<T>,
    handler: NotificationHandler<T>,
  ) {
    if (
      !(TypeGuards.isNotificationType(constructor) &&
        TypeGuards.isNotificationHandler(constructor, handler))
    ) {
      throw new Error(`Not a valid notification type`);
    }

    const { notificationTypeId } = constructor;

    this._handlers.set(notificationTypeId, [
      ...(this._handlers.get(notificationTypeId) ?? []),
      handler,
    ]);
  }

  public get<T extends Notification>(_value: T): NotificationHandler<T> {
    throw new Error("Method not implemented.");
  }

  public getMany<T extends Notification>(
    notification: T,
  ): Array<NotificationHandler<T>> {
    if (!TypeGuards.isNotification(notification)) {
      return [];
    }

    const { constructor } = notification;

    const result = this._handlers.get(constructor.notificationTypeId) ?? [];

    return result as Array<NotificationHandler<T>>;
  }

  public remove<TNotification extends Notification>(
    constructor: Constructor<TNotification>,
    handler: NotificationHandler<TNotification>,
  ) {
    if (
      !(TypeGuards.isNotificationType(constructor) &&
        TypeGuards.isNotificationHandler(constructor, handler))
    ) {
      throw new Error(`Not a valid notification type`);
    }

    const { name, notificationTypeId } = constructor;
    const foundHandlers = this._handlers.get(notificationTypeId) ?? [];
    const foundHandlerIndex = foundHandlers.indexOf(handler);

    if (foundHandlerIndex < 0) {
      throw new Error(`No handler found for notification, ${name}`);
    }

    this._handlers.set(notificationTypeId, [
      ...foundHandlers.slice(0, foundHandlerIndex),
      ...foundHandlers.slice(foundHandlerIndex + 1),
    ]);
  }
}
