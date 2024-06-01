import { PublishStrategy } from "./publish-strategy.ts";
import { Notification } from "./notification.ts";
import { NotificationHandler } from "./types.ts";

export interface IPublisher {
  publish<TNotification extends Notification>(
    notification: TNotification,
    handlers: Array<NotificationHandler<TNotification>>,
  ): Promise<void>;
}

const buildPublisher = (publish: IPublisher["publish"]): IPublisher => ({
  publish,
});

const parallelNoWaitPublisher = buildPublisher(
  (notification, handlers) => {
    handlers.forEach((handler) => handler(notification)?.catch(() => {}));

    return Promise.resolve();
  },
);

const parallelWhenAnyPublisher = buildPublisher(async (
  notification,
  handlers,
) => {
  const abortController = new AbortController();

  const result = await Promise.race(
    handlers.map((handler) =>
      handler(notification, abortController.signal)?.catch((error): Error =>
        error
      )
    ),
  );

  abortController.abort();

  if (result != null) {
    throw result;
  }
});

const parallelWhenAllPublisher = buildPublisher(
  async (notification, handlers) => {
    const results = await Promise.allSettled(
      handlers.map((handler) => handler(notification)),
    );

    const aggregateErrors = results
      .filter((result): result is PromiseRejectedResult =>
        result.status === "rejected" && result.reason != null
      )
      .map((result) => result.reason);

    if (aggregateErrors.length > 0) {
      throw new AggregateError(aggregateErrors);
    }
  },
);

const syncContinueOnExceptionPublisher = buildPublisher(
  async (notification, handlers) => {
    const aggregateErrors: Error[] = [];

    for (const handler of handlers) {
      try {
        await handler(notification);
      } catch (error) {
        aggregateErrors.push(error);
      }
    }

    if (aggregateErrors.length > 0) {
      throw new AggregateError(aggregateErrors);
    }
  },
);

const syncStopOnExceptionPublisher = buildPublisher(
  async (notification, handlers) => {
    for (const handler of handlers) {
      await handler(notification);
    }
  },
);

const publishers: Record<PublishStrategy, IPublisher> = {
  [PublishStrategy.ParallelNoWait]: parallelNoWaitPublisher,
  [PublishStrategy.ParallelWhenAny]: parallelWhenAnyPublisher,
  [PublishStrategy.ParallelWhenAll]: parallelWhenAllPublisher,
  [PublishStrategy.Async]: parallelWhenAllPublisher,
  [PublishStrategy.SyncContinueOnException]: syncContinueOnExceptionPublisher,
  [PublishStrategy.SyncStopOnException]: syncStopOnExceptionPublisher,
};

export class PublisherFactory {
  static create(publishStrategy: PublishStrategy): IPublisher {
    const publisher = publishers[publishStrategy];

    if (publisher == null) {
      throw new Error(`Invalid publish strategy`);
    }

    return publisher;
  }
}
