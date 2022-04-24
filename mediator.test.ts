import { Mediator } from "./mediator.ts";
import { Notification } from "./notification.ts";
import { PublishStrategy } from "./publish-strategy.ts";
import { Request } from "./request.ts";
import {
  assertEquals,
  assertRejects,
  assertThrows,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.136.0/testing/bdd.ts";

describe("Mediator", () => {
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

  describe("handle()", () => {
    it("when request type, it succeeds", () => {
      mediator.handle(TestClass1, () => Promise.resolve(expected));
    });

    it("when notification type, it succeeds", () => {
      mediator.handle(TestNotification1, () => Promise.resolve());
    });

    it(
      "when multiple handlers for same notification type, it succeeds",
      () => {
        mediator.handle(TestNotification1, () => Promise.resolve());
      },
    );

    it(
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

    it("when handler with void response, it succeeds", () => {
      mediator.send(new TestClass3());
    });

    it("when handler with value response, it succeeds", async () => {
      assertEquals(
        await mediator.send(new TestClass1()),
        expected,
      );
    });

    it(
      "when no registered handler, it throws exception",
      () => {
        assertThrows(() => mediator.send(new UnregisteredRequest()));
      },
    );

    it(
      "when no registered async handler, it throws exception",
      () => {
        assertRejects(() => mediator.send(new UnregisteredPromiseRequest()));
      },
    );
  });

  describe("publish()", () => {
    it("when notification, it calls correct handlers", async () => {
      await mediator.publish(new TestNotification1());
    });
  });
});
