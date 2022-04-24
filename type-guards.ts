// deno-lint-ignore-file no-explicit-any ban-types
import { Notification } from "./notification.ts";
import { Request } from "./request.ts";
import {
  Constructor,
  Handler,
  NotificationHandler,
  NotificationType,
  RequestHandler,
  RequestOrNotification,
  RequestType,
} from "./types.ts";

function isNotification<TNotification extends Notification>(
  request: TNotification,
): request is TNotification & {
  constructor: NotificationType<Notification>;
} {
  return isNotificationConstructor(request.constructor);
}

function isNotificationConstructor(
  constructor: Function,
): constructor is Constructor<Notification> {
  const { notificationTypeId } = constructor as NotificationType<Notification>;

  return (
    notificationTypeId != null &&
    typeof notificationTypeId === "symbol"
  );
}

function isNotificationType(
  constructor: Constructor,
): constructor is NotificationType {
  const { notificationTypeId } = constructor as NotificationType;

  return (
    notificationTypeId != null &&
    typeof notificationTypeId === "symbol"
  );
}

function isRequestType(
  constructor: Constructor,
): constructor is RequestType {
  const { requestTypeId } = constructor as RequestType;

  return (
    requestTypeId != null &&
    typeof requestTypeId === "symbol"
  );
}

function isRequest<TRequest extends Request>(
  request: RequestOrNotification,
): request is TRequest & { constructor: RequestType<TRequest> } {
  return isRequestConstructor(request.constructor);
}

function isRequestConstructor(
  constructor: any,
): constructor is Constructor<Request> {
  return (
    constructor.requestTypeId != null &&
    typeof constructor.requestTypeId === "symbol"
  );
}

function isRequestHandler<T extends RequestOrNotification>(
  handler: Handler<T>,
): handler is RequestHandler<T> {
  return true;
}

function isNotificationHandler<T extends RequestOrNotification>(
  handler: Handler<T>,
): handler is NotificationHandler {
  return true;
}

export const TypeGuards = {
  isRequest,
  isRequestConstructor,
  isRequestHandler,
  isRequestType,
  isNotification,
  isNotificationConstructor,
  isNotificationHandler,
  isNotificationType,
};
