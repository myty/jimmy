import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";
import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { PublisherFactory } from "./publisher-factory.ts";
import { assertLessThan, delayAsync as delay } from "./testing-utils/index.ts";
import { NotificationHandler } from "./types.ts";
import { debug } from "./debug-utils.ts";

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

Rhum.testPlan("PublisherFactory", () => {
  Rhum.testSuite("create()", () => {
    Rhum.testSuite("when ParallelNoWait", () => {
      Rhum.testCase(
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

          Rhum.asserts.assertEquals(result, expectedArray);

          await publisher.stop();
        },
      );
    });

    Rhum.testSuite("when ParallelWhenAny", () => {
      Rhum.testCase(
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

          Rhum.asserts.assertEquals(result, expectedArray);

          await publisher.stop();
        },
      );

      Rhum.testCase(
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

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(notification, handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          Rhum.asserts.assertEquals(result, expectedArray);

          await publisher.stop();
        },
      );
    });

    Rhum.testSuite("when ParallelWhenAll", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.ParallelWhenAll,
      );

      Rhum.afterEach(async () => await publisher.stop());

      Rhum.testCase(
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

          Rhum.asserts.assertEquals(result, expectedArray);
        },
      );

      Rhum.testCase(
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

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(notification, handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          Rhum.asserts.assertEquals(result, expectedArray);
        },
      );
    });

    Rhum.testSuite("when Async", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.Async,
      );

      Rhum.afterEach(async () => await publisher.stop());

      Rhum.testCase(
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

          Rhum.asserts.assertEquals(result, expectedArray);
        },
      );

      Rhum.testCase(
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

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(notification, handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          Rhum.asserts.assertEquals(result, expectedArray);
        },
      );
    });

    Rhum.testSuite("when SyncContinueOnException", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.SyncContinueOnException,
      );

      Rhum.afterEach(async () => await publisher.stop());

      Rhum.testCase(
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

          Rhum.asserts.assertEquals(result, expectedArray);
        },
      );

      Rhum.testCase(
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

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(notification, handlers);
          });

          Rhum.asserts.assertEquals(result, expectedArray);
        },
      );
    });

    Rhum.testSuite("when SyncStopOnException", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.SyncStopOnException,
      );

      Rhum.afterEach(async () => await publisher.stop());

      Rhum.testCase(
        "publisher.publish() returns when all handlers return",
        async () => {
          const notification = new TestNotification();
          const expectedArray: TestResult[] = [{ value: 1, notification }];

          const { handlers, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("SyncStopOnException Error") },
            { delay: 250, result: 3 },
          ]);

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(notification, handlers);
          });

          Rhum.asserts.assertEquals(result, expectedArray);
        },
      );
    });
  });
});

Rhum.run();
