import { Notification } from "./notification.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";

Rhum.testPlan("Notification", () => {
  // Setup
  class TestNotification1 extends Notification {}
  class TestNotification2 extends Notification {}

  Rhum.testSuite("notificationTypeId", () => {
    Rhum.testCase("is unique for each notification class", () => {
      Rhum.asserts.assertNotEquals(
        TestNotification1.notificationTypeId,
        TestNotification2.notificationTypeId,
      );
    });
  });
});

Rhum.run();
