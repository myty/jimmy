import { Notification } from "./notification.ts";
import { assertNotEquals } from "@std/assert";
import { describe, test } from "@std/testing/bdd";

describe("Notification", () => {
  // Setup
  class TestNotification1 extends Notification {}
  class TestNotification2 extends Notification {}

  describe("notificationTypeId", () => {
    test("is unique for each notification class", () => {
      assertNotEquals(
        TestNotification1.notificationTypeId,
        TestNotification2.notificationTypeId,
      );
    });
  });
});
