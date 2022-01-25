import { Notification } from "./notification.ts";
import { Request } from "./request.ts";

export type AnyType = any;

export type Response<TRequest> = TRequest extends Request<infer TResponse>
  ? TResponse
  : never;

export type RequestHandler<TRequest extends Request> = (
  request: TRequest,
) => Response<TRequest>;

export type NotificationHandler<TNotification extends Notification> = (
  notification: TNotification,
) => Promise<void>;

export type RequestConstructor<TRequest extends Request> =
  & (new (
    ...args: AnyType
  ) => AnyType)
  & {
    prototype: TRequest;
  }
  & {
    requestTypeId: symbol;
  };

export type NotificationConstructor<TNotification extends Notification> =
  & (new (
    ...args: AnyType
  ) => AnyType)
  & {
    prototype: TNotification;
  }
  & {
    notificationTypeId: symbol;
  };
