import { AssertionError } from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";
import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { PublisherFactory } from "./publisher-factory.ts";
import { NotificationHandler } from "./types.ts";

const setupHandlers = (
  handlerConfigs: { delay: number; result: number | Error }[],
) => {
  const timeoutIds: number[] = [];
  const result: number[] = [];
  const handlers: Array<NotificationHandler> = [];

  const clear = () => {
    for (const timeoutId of timeoutIds) {
      clearTimeout(timeoutId);
    }
  };

  for (const config of handlerConfigs) {
    handlers.push(() => {
      const promise = new Promise<void>((resolve, reject) => {
        timeoutIds.push(setTimeout(() => {
          if (config.result instanceof Error) {
            reject(config.result);
            return;
          }

          result.push(config.result);
          resolve();
        }, config.delay));
      });
      return promise;
    });
  }

  return {
    handlers,
    clear,
    result,
  };
};

function assertLessThan(actual: number, expected: number, msg?: string): void {
  if (actual >= expected) {
    msg = msg ?? `"${actual}" (actual) expected to be less than "${expected}"`;
    throw new AssertionError(msg);
  }
}

class TestNotification extends Notification {}

Rhum.testPlan("PublisherFactory", () => {
  Rhum.testSuite("create()", () => {
    Rhum.testSuite("when ParallelNoWait", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.ParallelNoWait,
      );

      Rhum.testCase(
        "publisher.publish() returns immediately",
        () => {
          const expectedArray: number[] = [];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          publisher.publish(new TestNotification(), handlers);

          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );
    });

    Rhum.testSuite("when ParallelWhenAny", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.ParallelWhenAny,
      );

      Rhum.testCase(
        "publisher.publish() returns first returned value",
        async () => {
          const expectedArray: number[] = [3];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(new TestNotification(), handlers);

          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const expectedArray: number[] = [];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("Test Error") },
            { delay: 100, result: 3 },
          ]);

          const start = new Date().getTime();

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(new TestNotification(), handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );
    });

    Rhum.testSuite("when ParallelWhenAll", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.ParallelWhenAll,
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers return",
        async () => {
          const expectedArray: number[] = [3, 1];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(new TestNotification(), handlers);

          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const expectedArray: number[] = [3, 1];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("Test Error") },
            { delay: 100, result: 3 },
          ]);

          const start = new Date().getTime();

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(new TestNotification(), handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );
    });

    Rhum.testSuite("when Async", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.Async,
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers return",
        async () => {
          const expectedArray: number[] = [3, 1];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(new TestNotification(), handlers);

          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const expectedArray: number[] = [3, 1];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("Test Error") },
            { delay: 100, result: 3 },
          ]);

          const start = new Date().getTime();

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(new TestNotification(), handlers);
          });

          const elapsedTime = new Date().getTime() - start;

          assertLessThan(elapsedTime, 300);
          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );
    });

    Rhum.testSuite("when SyncContinueOnException", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.SyncContinueOnException,
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers complete",
        async () => {
          const expectedArray: number[] = [1, 3];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: 3 },
          ]);

          await publisher.publish(new TestNotification(), handlers);

          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers complete and one throws",
        async () => {
          const expectedArray: number[] = [1, 3];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("Test Error") },
            { delay: 100, result: 3 },
          ]);

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(new TestNotification(), handlers);
          });

          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );
    });

    Rhum.testSuite("when SyncStopOnException", () => {
      const publisher = PublisherFactory.create(
        PublishStrategy.SyncStopOnException,
      );

      Rhum.testCase(
        "publisher.publish() returns when all handlers return",
        async () => {
          const expectedArray: number[] = [1];

          const { handlers, clear, result } = setupHandlers([
            { delay: 150, result: 1 },
            { delay: 50, result: new Error("Test Error") },
            { delay: 250, result: 3 },
          ]);

          await Rhum.asserts.assertThrowsAsync(async () => {
            await publisher.publish(new TestNotification(), handlers);
          });

          Rhum.asserts.assertEquals(result, expectedArray);

          clear();
        },
      );
    });
  });
});

Rhum.run();
