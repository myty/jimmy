import { Notification } from "./notification.ts";
import { Request } from "./request.ts";

export type Response<TRequest> = TRequest extends Request<infer TResponse>
  ? TResponse
  : unknown;

export type RequestOrNotification<T = Request | Notification> = T extends
  Request<infer TResponse> ? Request<TResponse>
  : T extends Notification ? Notification
  : never;

export type RequestHandler<
  TRequest = Request,
> = TRequest extends Request ? ((
  request: TRequest,
) => Response<TRequest>)
  : never;

export type NotificationHandler<
  TNotification extends Notification = Notification,
> = (
  notification: TNotification,
  onAbort: (callback: () => void) => void,
) => Promise<void> | void;

export type Handler<T extends RequestOrNotification = RequestOrNotification> = (
  | RequestHandler<T>
  | NotificationHandler<T>
);

export type HandlerDefinition<
  T extends RequestOrNotification = RequestOrNotification,
> = {
  type: Constructor<T>;
  handle: T extends Request ? RequestHandler<T> : NotificationHandler<T>;
};

export type BaseType<T extends RequestOrNotification> = T extends Request
  ? typeof Request
  : T extends Notification ? typeof Notification
  : never;

export type RequestType<TRequest = Request> = TRequest extends Request ? (
  & Constructor<TRequest>
  & BaseType<TRequest>
)
  : never;

export type NotificationType<
  TNotification = Notification,
> = TNotification extends Notification ? (
  & Constructor<TNotification>
  & BaseType<TNotification>
)
  : never;

export type RequestOrNotificationClass<
  T extends RequestOrNotification = RequestOrNotification,
> = Constructor<T> & BaseType<T>;

export type Constructor<
  T extends RequestOrNotification = RequestOrNotification,
> = new (
  ...args: unknown[]
) => T;

export interface HandlerStore<T extends Request | Notification> {
  add(constructor: Constructor<T>, handler: Handler<T>): void;
  get(value: T): Handler<T>;
  getMany(notification: T): Array<Handler<T>>;
  remove(constructor: Constructor<T>, handler: Handler<T>): void;
}
