import { Notification } from "./notification.ts";
import { Request } from "./request.ts";
import {
  Constructor,
  Handler,
  Message,
  NotificationConstructor,
  NotificationHandler,
  RequestConstructor,
  RequestHandler,
} from "./types.ts";

function isNotification<TNotification extends Notification>(
  request: TNotification,
): request is TNotification & { constructor: NotificationConstructor } {
  return isNotificationConstructor(request.constructor as Constructor<Message>);
}

function isNotificationHandler(
  handler: Handler<Message>,
): handler is NotificationHandler<Notification> {
  return typeof handler === "function";
}

function isNotificationConstructor(
  constructor: Constructor<Message>,
): constructor is NotificationConstructor<Notification> {
  return (
    "notificationTypeId" in constructor &&
    constructor.notificationTypeId != null &&
    typeof constructor.notificationTypeId === "symbol"
  );
}

function isRequest<TRequest extends Request = Request>(
  request: TRequest,
): request is TRequest & { constructor: RequestConstructor<Request> } {
  return isRequestConstructor(request.constructor as Constructor<Message>);
}

function isRequestConstructor(
  constructor: Constructor<Message>,
): constructor is RequestConstructor<Request> {
  return (
    "requestTypeId" in constructor &&
    constructor.requestTypeId != null &&
    typeof constructor.requestTypeId === "symbol"
  );
}

function isRequestHandler(
  handler: Handler<Message>,
): handler is RequestHandler<Request> {
  return typeof handler === "function";
}

export const TypeGuards = {
  isRequestConstructor,
  isRequestHandler,
  isRequest,
  isNotification,
  isNotificationHandler,
  isNotificationConstructor,
};
