import { Notification } from "./notification.ts";
import { Request } from "./request.ts";
import {
  AnyType,
  NotificationConstructor,
  RequestConstructor,
} from "./types.ts";

function isNotification<TNotification extends Notification>(
  request: TNotification,
): request is TNotification & { constructor: NotificationConstructor } {
  return isNotificationConstructor(request.constructor);
}

function isNotificationConstructor<TNotification extends Notification>(
  constructor: AnyType,
): constructor is NotificationConstructor<TNotification> {
  return (
    constructor.notificationTypeId != null &&
    typeof constructor.notificationTypeId === "symbol"
  );
}

function isRequest<TRequest extends Request>(
  request: TRequest,
): request is TRequest & { constructor: RequestConstructor<TRequest> } {
  return isRequestConstructor(request.constructor);
}

function isRequestConstructor(
  // deno-lint-ignore ban-types
  constructor: Function & { requestTypeId?: symbol },
): constructor is RequestConstructor {
  return (
    constructor.requestTypeId != null &&
    typeof constructor.requestTypeId === "symbol"
  );
}

export const TypeGuards = {
  isRequestConstructor,
  isRequest,
  isNotification,
  isNotificationConstructor,
};
