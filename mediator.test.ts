import { Mediator } from "./mediator.ts";
import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { Request } from "./request.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";

Rhum.testPlan("Mediator", () => {
  // Setup
  class TestClass1 extends Request<Promise<number>> {}
  class TestClass3 extends Request<void> {}
  class UnregisteredRequest extends Request<number> {}
  class UnregisteredPromiseRequest extends Request<Promise<number>> {}
  class TestNotification1 extends Notification {}

  const mediator = new Mediator({
    publishStratey: PublishStrategy.SyncContinueOnException,
  });
  const expected = 42;

  Rhum.testSuite("handle()", () => {
    Rhum.testCase("when request type, it succeeds", () => {
      mediator.handle(TestClass1, () => Promise.resolve(expected));
    });

    Rhum.testCase("when notification type, it succeeds", () => {
      mediator.handle(TestNotification1, () => Promise.resolve());
    });

    Rhum.testCase(
      "when multiple handlers for same notification type, it succeeds",
      () => {
        mediator.handle(TestNotification1, () => Promise.resolve());
      },
    );

    Rhum.testCase(
      "when handler for request type previously registered, it fails",
      () => {
        Rhum.asserts.assertThrows(() => {
          mediator.handle(TestClass1, () => Promise.resolve(expected));
        });
      },
    );
  });

  Rhum.testSuite("send()", () => {
    mediator.handle(TestClass3, () => {});

    Rhum.testCase("when handler with void response, it succeeds", () => {
      mediator.send(new TestClass3());
    });

    Rhum.testCase("when handler with value response, it succeeds", async () => {
      Rhum.asserts.assertEquals(
        await mediator.send(new TestClass1()),
        expected,
      );
    });

    Rhum.testCase(
      "when no registered handler, it throws exception",
      () => {
        Rhum.asserts.assertThrows(() =>
          mediator.send(new UnregisteredRequest())
        );
      },
    );

    Rhum.testCase(
      "when no registered async handler, it throws exception",
      () => {
        Rhum.asserts.assertRejects(() =>
          mediator.send(new UnregisteredPromiseRequest())
        );
      },
    );
  });

  Rhum.testSuite("publish()", () => {
    Rhum.testCase("when notification, it calls correct handlers", async () => {
      await mediator.publish(new TestNotification1());
    });
  });
});

Rhum.run();
