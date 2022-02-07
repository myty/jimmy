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

const parallelNoWaitPublisher = buildPublisher((notification, handlers) => {
  Promise.all(
    handlers.map((handler) => handler(notification)?.catch(() => {})),
  );

  return Promise.resolve();
});

const parallelWhenAnyPublisher = buildPublisher(async (
  notification,
  handlers,
) => {
  const result = await Promise.any(
    handlers.map((handler) =>
      handler(notification)?.catch((error): Error => error)
    ),
  );

  if (result != null) {
    throw result;
  }
});

const parallelWhenAllPublisher = buildPublisher(
  async (notification, handlers) => {
    const results = await Promise.all(
      handlers.map((handler) =>
        handler(notification)?.catch((error): Error => error)
      ),
    );

    const aggregateErrors: Error[] = results
      .filter((error): error is Error => error != null);

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
