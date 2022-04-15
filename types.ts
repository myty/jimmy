import { Notification } from "./notification.ts";
import { Request } from "./request.ts";

export type Response<TRequest> = TRequest extends Request<infer TResponse>
  ? TResponse
  : never;

export type RequestOrNotification<T = AnyType> = T extends
  Request<infer TResponse> ? Request<TResponse>
  : T extends Notification ? Notification
  : never;

export type RequestHandler<TRequest extends Request = Request<unknown>> = (
  request: TRequest,
) => Response<TRequest>;

export type NotificationHandler<
  TNotification extends Notification = Notification,
> = (
  notification: TNotification,
  onAbort: (callback: () => void) => void,
) => Promise<void> | void;

export type Handler<T extends RequestOrNotification = RequestOrNotification> =
  T extends Request ? RequestHandler<T>
    : T extends Notification ? NotificationHandler<T>
    : never;

export type HandlerDefinition<
  T extends RequestOrNotification = RequestOrNotification,
> = {
  type: Constructor<T>;
  handle: Handler<T>;
};

export type RequestConstructor<TRequest extends Request = Request> =
  & (new (
    ...args: unknown[]
  ) => TRequest)
  & {
    prototype: TRequest;
  }
  & Pick<typeof Request, "requestTypeId">;

export type NotificationConstructor<
  TNotification extends Notification = Notification,
> =
  & (new (
    ...args: unknown[]
  ) => TNotification)
  & {
    prototype: TNotification;
  }
  & Pick<typeof Notification, "notificationTypeId">;

export type Constructor<
  T extends RequestOrNotification = RequestOrNotification,
> = T extends Request ? RequestConstructor<T>
  : T extends Notification ? NotificationConstructor<T>
  : never;
