import { Mediator } from "./mediator.ts";
import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { Request } from "./request.ts";
import { assertEquals, assertThrows } from "@std/assert";
import { describe, test } from "@std/testing/bdd";

describe("Mediator", () => {
  // Setup
  class TestClass1 extends Request<Promise<number>> {}
  class TestClass3 extends Request {}
  class UnregisteredRequest extends Request<number> {}
  class UnregisteredPromiseRequest extends Request<Promise<number>> {}
  class TestNotification1 extends Notification {}

  const mediator = new Mediator({
    publishStratey: PublishStrategy.SyncContinueOnException,
  });
  const expected = 42;

  describe("handle()", () => {
    test("when request type, it succeeds", () => {
      mediator.handle(TestClass1, () => Promise.resolve(expected));
    });

    test("when notification type, it succeeds", () => {
      mediator.handle(TestNotification1, () => Promise.resolve());
    });

    test(
      "when multiple handlers for same notification type, it succeeds",
      () => {
        mediator.handle(TestNotification1, () => Promise.resolve());
      },
    );

    test(
      "when handler for request type previously registered, it fails",
      () => {
        assertThrows(() => {
          mediator.handle(TestClass1, () => Promise.resolve(expected));
        });
      },
    );
  });

  describe("send()", () => {
    mediator.handle(TestClass3, () => {});

    test("when handler with void response, it succeeds", () => {
      mediator.send(new TestClass3());
    });

    test("when handler with value response, it succeeds", async () => {
      assertEquals(
        await mediator.send(new TestClass1()),
        expected,
      );
    });

    test(
      "when no registered handler, it throws exception",
      () => {
        assertThrows(() => mediator.send(new UnregisteredRequest()));
      },
    );

    test(
      "when no registered async handler, it throws exception",
      () => {
        assertThrows(() => mediator.send(new UnregisteredPromiseRequest()));
      },
    );
  });

  describe("publish()", () => {
    test("when notification, it calls correct handlers", async () => {
      await mediator.publish(new TestNotification1());
    });
  });
});
