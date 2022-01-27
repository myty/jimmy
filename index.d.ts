// deno-lint-ignore no-explicit-any
type AnyType = any;

type Response<TRequest> = TRequest extends Request<infer TResponse> ? TResponse
  : never;

type RequestOrNotification<T> = T extends Request<infer TResponse>
  ? Request<TResponse>
  : T extends Notification ? Notification
  : never;

type RequestHandler<TRequest extends Request = Request<AnyType>> = (
  request: TRequest,
) => Response<TRequest>;

type NotificationHandler<TNotification extends Notification> = (
  notification: TNotification,
) => Promise<void>;

type Handler<T> = T extends Request ? RequestHandler<T>
  : T extends Notification ? NotificationHandler<T>
  : never;

type RequestConstructor<TRequest extends Request> =
  & (new (
    ...args: AnyType
  ) => AnyType)
  & {
    prototype: TRequest;
  }
  & {
    requestTypeId: symbol;
  };

type NotificationConstructor<TNotification extends Notification> =
  & (new (
    ...args: AnyType
  ) => AnyType)
  & {
    prototype: TNotification;
  }
  & {
    notificationTypeId: symbol;
  };

type Constructor<T> = T extends Request ? RequestConstructor<T>
  : T extends Notification ? NotificationConstructor<T>
  : never;

/**
 * Strategy to use when publishing notifications
 */
declare enum PublishStrategy {
  /**
   * Run each notification handler after one another. Returns when all handlers are finished. In case of any exception(s), they will be captured in an AggregateException.
   */
  SyncContinueOnException = 0,

  /**
   * Run each notification handler after one another. Returns when all handlers are finished or an exception has been thrown. In case of an exception, any handlers after that will not be run.
   */
  SyncStopOnException = 1,

  /**
   * Run all notification handlers asynchronously. Returns when all handlers are finished. In case of any exception(s), they will be captured in an AggregateException.
   */
  Async = 2,

  /**
   * Run each notification handler on it's own thread. Returns immediately and does not wait for any handlers to finish. Note that you cannot capture any exceptions, even if you await the call to publish.
   */
  ParallelNoWait = 3,

  /**
   * un each notification handler on it's own thread. Returns when all handlers are finished. In case of any exception(s), they are captured in an AggregateException.
   */
  ParallelWhenAll = 4,

  /**
   * Run each notification handler on it's own thread. Returns when any handler is finished. Note that you cannot capture any exceptions.
   */
  ParallelWhenAny = 5,
}

/**
 * Base class for all requests
 */
export declare abstract class Request<TResponse = void> {
  private static _requestTypeId: symbol;

  static requestTypeId: symbol;

  type(): TResponse;
}

/**
 * Base class for all notifications
 */
export declare abstract class Notification {
  static notificationTypeId: symbol;
}

/**
 * Configuration options for the mediator
 */
interface MediatorConfig {
  publishStratey?: PublishStrategy;
}

/**
 * Main mediator class that handles requests and notifications
 */
export declare class Mediator {
  constructor(config?: MediatorConfig);

  /**
   * Register a request or notification handler
   */
  public handle<TRequest extends (Request<AnyType> | Notification)>(
    constructor: Constructor<TRequest>,
    handler: Handler<TRequest>,
  ): void;

  /**
   * Publish a notification
   */
  public publish<TNotification extends Notification>(
    notificaiton: TNotification,
    publishStrategy?: PublishStrategy,
  ): Promise<void>;

  /**
   * Send a request
   */
  public send<TRequest extends Request>(
    requestOrNotification: TRequest,
  ): Response<TRequest>;
}
