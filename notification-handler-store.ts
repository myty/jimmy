import { Notification } from "./notification.ts";
import { TypeGuards } from "./type-guards.ts";
import { NotificationConstructor, NotificationHandler } from "./types.ts";

export class NotificationHandlerStore {
  private readonly _handlers: Map<symbol, Array<NotificationHandler>> =
    new Map();

  public add<TNotification extends Notification>(
    constructor: NotificationConstructor<TNotification>,
    handler: NotificationHandler<TNotification>,
  ) {
    const { notificationTypeId } = constructor;

    this._handlers.set(notificationTypeId, [
      ...(this._handlers.get(notificationTypeId) ?? []),
      handler as NotificationHandler,
    ]);
  }

  public get<TNotification extends Notification>(
    notification: TNotification,
  ): Array<NotificationHandler<TNotification>> {
    if (!TypeGuards.isNotification(notification)) {
      return [];
    }

    const { constructor } = notification;

    return this._handlers.get(constructor.notificationTypeId) ?? [];
  }

  public remove<TNotification extends Notification>(
    constructor: NotificationConstructor<TNotification>,
    handler: NotificationHandler<TNotification>,
  ) {
    const { name, notificationTypeId } = constructor;
    const foundHandlers = this._handlers.get(notificationTypeId) ?? [];
    const foundHandlerIndex = foundHandlers.indexOf(
      handler as NotificationHandler,
    );

    if (foundHandlerIndex < 0) {
      throw new Error(`No handler found for notification, ${name}`);
    }

    this._handlers.set(notificationTypeId, [
      ...foundHandlers.slice(0, foundHandlerIndex),
      ...foundHandlers.slice(foundHandlerIndex + 1),
    ]);
  }
}
