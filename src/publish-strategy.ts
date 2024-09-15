/**
 * Strategy to use when publishing notifications
 */
export enum PublishStrategy {
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
