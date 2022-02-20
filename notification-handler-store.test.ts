import { Notification, Request } from "./mod.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";
import { createHandler } from "./mod.ts";
import { NotificationHandler, RequestHandler } from "./types.ts";

Rhum.testPlan("NotificationHandlerStore", () => {
  Rhum.testSuite("createHandler()", () => {
    Rhum.testSuite("notifications", () => {
      // Setup
      class TestNotification extends Notification {
        public test1 = "test";
      }

      const notificationHandler: NotificationHandler<TestNotification> =
        () => {};

      Rhum.testCase("returns correct definition type", () => {
        const handlerDefinition = createHandler(
          TestNotification,
          notificationHandler,
        );

        Rhum.asserts.assertEquals(
          TestNotification,
          handlerDefinition.type,
        );
      });

      Rhum.testCase("returns correct definition handle", () => {
        const handlerDefinition = createHandler(
          TestNotification,
          notificationHandler,
        );

        Rhum.asserts.assertEquals(
          notificationHandler,
          handlerDefinition.handle,
        );
      });
    });

    Rhum.testSuite("requests", () => {
      // Setup
      class TestRequest extends Request {}

      const requestHandler: RequestHandler<TestRequest> = () => {};

      Rhum.testCase("returns correct definition type", () => {
        const handlerDefinition = createHandler<TestRequest>(
          TestRequest,
          requestHandler,
        );

        Rhum.asserts.assertEquals(
          TestRequest,
          handlerDefinition.type,
        );
      });

      Rhum.testCase("returns correct definition handle", () => {
        const handlerDefinition = createHandler(
          TestRequest,
          requestHandler,
        );

        Rhum.asserts.assertEquals(
          requestHandler,
          handlerDefinition.handle,
        );
      });
    });
  });
});

Rhum.run();
