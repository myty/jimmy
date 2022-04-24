import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { PublisherFactory } from "./publisher-factory.ts";
import { NotificationHandler } from "./types.ts";
import { assertLessThan, delayAsync as delay } from "./testing-utils/index.ts";
import {
  assertEquals,
  assertRejects,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
  afterEach,
  describe,
  it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";

class TestNotification extends Notification {
  public readonly id: string = crypto.randomUUID();
}

interface TestResult {
  value: number;
  notification: TestNotification;
}

const setupHandlers = (
  handlerConfigs: { delay: number; result: number | Error }[],
) => {
  const result: TestResult[] = [];
  const handlers = handlerConfigs.map((
    config,
  ): NotificationHandler<TestNotification> =>
    async (notification, onAbort) => {
      const abortController = new AbortController();
      await delay(config.delay, abortController.signal);

      onAbort(() => abortController.abort());

      if (config.result instanceof Error) {
        throw config.result;
      }

      result.push({ value: config.result, notification });
    }
  );

  return {
    handlers,
    result,
  };
};

describe("PublisherFactory", () => {
  describe("create()", () => {
    describe("when ParallelNoWait", () => {
      it(
        "publisher.publish() returns immediately",
        async () => {
          const publisher = PublisherFactory.create(
            PublishStrategy.ParallelNoWait,
          );
          const expectedArray: TestResult[] = [];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          publisher.publish(new TestNotification(), handlers);

          assertEquals(result, expectedArray);

          await publisher.stop();
        },
      );
    });

    describe("when ParallelWhenAny", () => {
      it(
        "publisher.publish() returns first returned value",
        async () => {
          const publisher = PublisherFactory.create(
            PublishStrategy.ParallelWhenAny,
          );

          const testNotification = new TestNotification();
          const expectedArray: TestResult[] = [{
            value: 3,
            notification: testNotification,
          }];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(testNotification, handlers);

          assertEquals(result, expectedArray);

          await publisher.stop();
        },
      );

      it(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const publisher = PublisherFactory.create(
            PublishStrategy.ParallelWhenAny,
          );

          const notification = new TestNotification();
          const expectedArray: TestResult[] = [];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("ParallelWhenAny Error") },
            { delay: 100, result: 3 },
          ]);

          const start = new Date().getTime();

          await assertRejects(async () => {
            await publisher.publish(notification, handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          assertEquals(result, expectedArray);

          await publisher.stop();
        },
      );
    });

    describe("when ParallelWhenAll", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.ParallelWhenAll,
      );

      afterEach(async () => await publisher.stop());

      it(
        "publisher.publish() returns when all handlers return",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [
            { value: 3, notification },
            { value: 1, notification },
          ];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(notification, handlers);

          assertEquals(result, expectedArray);
        },
      );

      it(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [
            { value: 3, notification },
            { value: 1, notification },
          ];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("ParallelWhenAll Error") },
            { delay: 100, result: 3 },
          ]);

          const start = new Date().getTime();

          await assertRejects(async () => {
            await publisher.publish(notification, handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          assertEquals(result, expectedArray);
        },
      );
    });

    describe("when Async", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.Async,
      );

      afterEach(async () => await publisher.stop());

      it(
        "publisher.publish() returns when all handlers return",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [
            { value: 3, notification },
            { value: 1, notification },
          ];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(notification, handlers);

          assertEquals(result, expectedArray);
        },
      );

      it(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [
            { value: 3, notification },
            { value: 1, notification },
          ];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("Async Error") },
            { delay: 100, result: 3 },
          ]);

          const start = new Date().getTime();

          await assertRejects(async () => {
            await publisher.publish(notification, handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          assertEquals(result, expectedArray);
        },
      );
    });

    describe("when SyncContinueOnException", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.SyncContinueOnException,
      );

      afterEach(async () => await publisher.stop());

      it(
        "publisher.publish() returns when all handlers complete",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [
            { value: 1, notification },
            { value: 3, notification },
          ];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(notification, handlers);

          assertEquals(result, expectedArray);
        },
      );

      it(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [{ value: 1, notification }, {
            value: 3,
            notification,
          }];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("SyncContinueOnException Error") },
            { delay: 100, result: 3 },
          ]);

          await assertRejects(async () => {
            await publisher.publish(notification, handlers);
          });

          assertEquals(result, expectedArray);
        },
      );
    });

    describe("when SyncStopOnException", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.SyncStopOnException,
      );

      afterEach(async () => await publisher.stop());

      it(
        "publisher.publish() returns when all handlers return",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [{ value: 1, notification }];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("SyncStopOnException Error") },
            { delay: 250, result: 3 },
          ]);

          await assertRejects(async () => {
            await publisher.publish(notification, handlers);
          });

          assertEquals(result, expectedArray);
        },
      );
    });
  });
});
