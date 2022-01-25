import { Notification } from "./notification.ts";
import {
  assertNotEquals,
} from "https://deno.land/std@0.122.0/testing/asserts.ts";

Deno.test("Notification", async (t) => {
  // Setup
  class TestNotification1 extends Notification {}
  class TestNotification2 extends Notification {}

  await t.step(
    "notificationTypeId is unique for each notification class",
    () => {
      assertNotEquals(
        TestNotification1.notificationTypeId,
        TestNotification2.notificationTypeId,
      );
    },
  );
});
