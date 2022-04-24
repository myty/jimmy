import { PublishStrategy } from "./publish-strategy.ts";
import { Notification } from "./notification.ts";
import { NotificationHandler } from "./types.ts";
import { debug } from "./debug-utils.ts";

const noOpCallback = (): void => {};

export interface IPublisher {
  publish<TNotification extends Notification>(
    notification: TNotification,
    handlers: NotificationHandler<TNotification>[],
  ): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
}

class PendingPromisesState {
  private runningHandlers = 0;
  private doneWaitingTrigger = () => {};

  constructor() {
    this.increment = this.increment.bind(this);
    this.decrement = this.decrement.bind(this);
    this.waitToClear = this.waitToClear.bind(this);
  }

  public increment(): void {
    this.runningHandlers += 1;
  }

  public decrement(): void {
    this.runningHandlers -= 1;

    if (this.runningHandlers < 1) {
      this.doneWaitingTrigger();
    }
  }

  public async waitToClear(): Promise<void> {
    if (this.runningHandlers < 1) {
      return;
    }

    await new Promise<void>((resolve) => {
      this.doneWaitingTrigger = () => {
        debug("All handlers are done");
        resolve();
      };
    });
  }
}

function wrapHandlers<TNotification extends Notification>(
  handlers: NotificationHandler<TNotification>[],
  abortController: AbortController,
): NotificationHandler<TNotification>[] {
  return handlers.map(
    (handler): NotificationHandler<TNotification> => {
      return async (
        notification,
        onAbort,
      ) => {
        let cleanupEventListener: () => void = noOpCallback;

        onAbort(cleanupEventListener);

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
      };
    },
  );
}

const buildPublisher = (publish: IPublisher["publish"]): IPublisher => {
  let abortController = new AbortController();
  let isStarted = true;
  const pendingPromises: PendingPromisesState = new PendingPromisesState();

  return ({
    async publish<TNotification extends Notification>(
      notification: TNotification,
      handlers: Array<NotificationHandler<TNotification>>,
    ) {
      if (!isStarted) {
        return;
      }

      try {
        pendingPromises.increment();
        await publish(notification, wrapHandlers(handlers, abortController));
      } catch (error) {
        throw error;
      } finally {
        pendingPromises.decrement();
      }
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

      // Wait for all running handlers to finish
      await pendingPromises.waitToClear();
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

const parallelAsyncPublisher = buildPublisher(
  async (notification, handlers) => {
    const results = await Promise.allSettled(
      handlers.map(async (handler) => {
        try {
          await handler(notification, noOpCallback);
        } catch (error) {
          return error;
        }
      }),
    );

    const aggregateErrors: PromiseSettledResult<Error>[] = results
      .filter((
        result,
      ): result is PromiseFulfilledResult<
        Error
      > => (result.status === "fulfilled" && result.value instanceof Error));

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
  [PublishStrategy.Async]: parallelAsyncPublisher,
  [PublishStrategy.SyncContinueOnException]: syncContinueOnExceptionPublisher,
  [PublishStrategy.SyncStopOnException]: syncStopOnExceptionPublisher,
};

export class PublisherFactory {
  static create(
    publishStrategy: PublishStrategy,
  ): IPublisher {
    const publisher = publishers[publishStrategy];

    if (publisher == null) {
      throw new Error(`Invalid publish strategy`);
    }

    return publisher;
  }
}
