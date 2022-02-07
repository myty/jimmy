import { Notification } from "./notification.ts";
import { TypeGuards } from "./type-guards.ts";
import { NotificationConstructor, NotificationHandler } from "./types.ts";

export class NotificationHandlerStore {
  private _handlers: Record<symbol, Array<NotificationHandler>> = {};

  public add<TNotification extends Notification>(
    constructor: NotificationConstructor<TNotification>,
    handler: NotificationHandler<TNotification>,
  ) {
    const { notificationTypeId } = constructor;
    this._handlers = {
      ...this._handlers,
      [notificationTypeId]: [
        ...(this._handlers[notificationTypeId] ?? []),
        handler as NotificationHandler,
      ],
    };
  }

  public get<TNotification extends Notification>(
    notification: TNotification,
  ): Array<NotificationHandler<TNotification>> {
    if (!TypeGuards.isNotification(notification)) {
      return [];
    }

    const { constructor } = notification;
    const handlers = this._handlers[constructor.notificationTypeId] ?? [];
    return handlers;
  }
}
