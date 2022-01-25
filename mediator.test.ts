import {
  assertEquals,
  assertRejects,
  assertThrows,
} from "https://deno.land/std@0.122.0/testing/asserts.ts";
import { Mediator } from "./mediator.ts";
import { Notification } from "./notification.ts";
import { Request } from "./request.ts";

Deno.test("Mediator", async (t) => {
  // Setup
  class TestClass1 extends Request<Promise<number>> {}
  class TestClass3 extends Request {}
  class UnregisteredRequest extends Request<number> {}
  class UnregisteredPromiseRequest extends Request<Promise<number>> {}
  class TestNotification1 extends Notification {}
  class UnregisteredNotification extends Notification {}
  const mediator = new Mediator();
  const expected = 42;

  await t.step("can add handler for request type", () => {
    mediator.handle(TestClass1, () => Promise.resolve(expected));
  });

  await t.step("can add handler for notification type", () => {
    mediator.notification(TestNotification1, () => Promise.resolve());
  });

  await t.step("can add multiple handlers for same notification type", () => {
    mediator.notification(TestNotification1, () => Promise.resolve());
  });

  await t.step("can add handler with no response for request type", () => {
    mediator.handle(TestClass3, () => {});
    mediator.send(new TestClass3());
  });

  await t.step(
    "cannot add a request handler for the same type more than once",
    () => {
      assertThrows(() => {
        mediator.handle(TestClass1, () => Promise.resolve(expected));
      });
    },
  );

  await t.step("send request calls correct handler", async () => {
    assertEquals(await mediator.send(new TestClass1()), expected);
  });

  await t.step("publish notification calls correct handlers", async () => {
    await mediator.publish(new TestNotification1());
  });

  await t.step(
    "send request has exception if there is no registered handler",
    () => {
      assertThrows(() => mediator.send(new UnregisteredRequest()));
    },
  );

  await t.step(
    "send async request has exception if there is no registered handler",
    () => {
      assertRejects(() => mediator.send(new UnregisteredPromiseRequest()));
    },
  );

  await t.step(
    "publish notification has exception if there are no registered handlers",
    () => {
      assertRejects(() => mediator.publish(new UnregisteredNotification()));
    },
  );
});
