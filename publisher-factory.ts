import { PublishStrategy } from "./publish-strategy.ts";
import { Notification } from "./notification.ts";
import { NotificationHandler } from "./types.ts";

const noOpCallback = (): void => {};

export interface IPublisher {
  publish<TNotification extends Notification>(
    notification: TNotification,
    handlers: Array<NotificationHandler<TNotification>>,
  ): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

const buildPublisher = (publish: IPublisher["publish"]): IPublisher => {
  let isStarted = true;
  let abortController = new AbortController();

  return ({
    async publish<TNotification extends Notification>(
      notification: TNotification,
      handlers: Array<NotificationHandler<TNotification>>,
    ) {
      if (!isStarted) {
        return;
      }

      const wrappedHandlers = handlers.map(
        (handler): NotificationHandler<TNotification> => {
          return async (notification) => {
            try {
              let cleanupEventListener: () => void = noOpCallback;

              await handler(notification, function (onAbortCallback) {
                cleanupEventListener = () => {
                  abortController.signal.removeEventListener(
                    "abort",
                    onAbortCallback,
                  );
                };

                abortController.signal.addEventListener(
                  "abort",
                  onAbortCallback,
                );
              });

              cleanupEventListener();
            } catch (error) {
              return error;
            }
          };
        },
      );

      await publish(notification, wrappedHandlers);
    },
    async start() {
      if (isStarted) {
        return;
      }

      isStarted = true;
      abortController = new AbortController();

      await Promise.resolve();
    },
    async stop() {
      isStarted = false;
      abortController.abort();

      await Promise.resolve();
    },
  });
};

const parallelNoWaitPublisher = buildPublisher((notification, handlers) => {
  return new Promise((resolve) => {
    Promise.allSettled(
      handlers.map((handler) =>
        handler(notification, noOpCallback)?.catch(noOpCallback)
      ),
    ).catch(noOpCallback).finally(noOpCallback);

    resolve();
  });
});

const parallelWhenAnyPublisher = buildPublisher(async (
  notification,
  handlers,
) => {
  const abortController = new AbortController();

  const result = await Promise.any(
    handlers.map(async (handler) => {
      try {
        let cleanupEventListener: () => void = noOpCallback;

        await handler(notification, function (abortCallback) {
          cleanupEventListener = () => {
            abortController.signal.removeEventListener(
              "abort",
              abortCallback,
            );
          };

          abortController.signal.addEventListener("abort", abortCallback);
        });

        cleanupEventListener();
      } catch (error) {
        return error;
      }
    }),
  );

  abortController.abort();

  if (result != null) {
    throw result;
  }
});

const parallelWhenAllPublisher = buildPublisher(
  async (notification, handlers) => {
    const results = await Promise.all(
      handlers.map((handler) =>
        handler(notification, noOpCallback)?.catch((error): Error => error)
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
        await handler(notification, noOpCallback);
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
      await handler(notification, noOpCallback);
    }
  },
);

const publishers: Record<
  PublishStrategy,
  IPublisher
> = {
  [PublishStrategy.ParallelNoWait]: parallelNoWaitPublisher,
  [PublishStrategy.ParallelWhenAny]: parallelWhenAnyPublisher,
  [PublishStrategy.ParallelWhenAll]: parallelWhenAllPublisher,
  [PublishStrategy.Async]: parallelWhenAllPublisher,
  [PublishStrategy.SyncContinueOnException]: syncContinueOnExceptionPublisher,
  [PublishStrategy.SyncStopOnException]: syncStopOnExceptionPublisher,
};

export class PublisherFactory {
  static create(
    publishStrategy: PublishStrategy,
    abortController?: AbortController,
  ): IPublisher {
    const publisher = publishers[publishStrategy];

    if (publisher == null) {
      throw new Error(`Invalid publish strategy`);
    }

    return publisher;
  }
}
