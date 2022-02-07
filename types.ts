import { Notification } from "./notification.ts";
import { Request } from "./request.ts";

// deno-lint-ignore no-explicit-any
export type AnyType = any;

export type Response<TRequest> = TRequest extends Request<infer TResponse>
  ? TResponse
  : never;

export type RequestOrNotification<T> = T extends Request<infer TResponse>
  ? Request<TResponse>
  : T extends Notification ? Notification
  : never;

export type RequestHandler<TRequest extends Request = Request<AnyType>> = (
  request: TRequest,
) => Response<TRequest>;

export type NotificationHandler<
  TNotification extends Notification = Notification,
> = (
  notification: TNotification,
) => Promise<void> | void;

export type Handler<T> = T extends Request ? RequestHandler<T>
  : T extends Notification ? NotificationHandler<T>
  : never;

export type RequestConstructor<TRequest extends Request = Request> =
  & (new (
    ...args: AnyType
  ) => AnyType)
  & {
    prototype: TRequest;
  }
  & {
    requestTypeId: symbol;
  };

export type NotificationConstructor<
  TNotification extends Notification = Notification,
> =
  & (new (
    ...args: AnyType
  ) => AnyType)
  & {
    prototype: TNotification;
  }
  & {
    notificationTypeId: symbol;
  };

export type Constructor<T> = T extends Request ? RequestConstructor<T>
  : T extends Notification ? NotificationConstructor<T>
  : never;
