import {
  Handler,
  HandlerDefinition,
  NotificationConstructor,
  RequestConstructor,
  RequestOrNotification,
} from "./types.ts";
import { Notification, Request } from "./mod.ts";

export const createHandler = <
  TRequestOrNotification extends RequestOrNotification,
>(
  type: TRequestOrNotification extends Request
    ? RequestConstructor<TRequestOrNotification>
    : TRequestOrNotification extends Notification
      ? NotificationConstructor<TRequestOrNotification>
    : never,
  handle: Handler<TRequestOrNotification>,
): HandlerDefinition => ({
  type,
  handle,
});
