import { Notification } from "./notification.ts";
import {
  assertNotEquals,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.136.0/testing/bdd.ts";

describe("Notification", () => {
  // Setup
  class TestNotification1 extends Notification {}
  class TestNotification2 extends Notification {}

  describe("notificationTypeId", () => {
    it("is unique for each notification class", () => {
      assertNotEquals(
        TestNotification1.notificationTypeId,
        TestNotification2.notificationTypeId,
      );
    });
  });
});
