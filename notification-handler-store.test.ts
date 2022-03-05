import { Notification, Request } from "./mod.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";
import { createHandler } from "./mod.ts";
import { NotificationHandler, RequestHandler } from "./types.ts";
import { NotificationHandlerStore } from "./notification-handler-store.ts";
import { Handler } from "./types.ts";

// Setup
class TestNotification1 extends Notification {
  public test1 = "test1";
}

class TestNotification2 extends Notification {
  public test2 = "test2";
}

class TestNotification3 extends Notification {
  public test2 = "test3";
}

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

  Rhum.testSuite("remove()", () => {
    let store: NotificationHandlerStore;
    Rhum.beforeEach(() => {
      store = new NotificationHandlerStore();
    });

    Rhum.testCase("can remove a NotificationHandler", () => {
      const handler: Handler<TestNotification1> = () => {};
      const notification = new TestNotification1();

      store.add(TestNotification1, handler);
      Rhum.asserts.assertEquals(store.get(notification), [handler]);

      store.remove(TestNotification1, handler);
      Rhum.asserts.assertEquals(store.get(notification), []);
    });

    Rhum.testCase(
      "removing a RequestHandler that is not in store, throws exception",
      () => {
        const handler: Handler<TestNotification1> = () => {};

        Rhum.asserts.assertThrows(() =>
          store.remove(TestNotification1, handler)
        );
      },
    );
  });
});

Rhum.run();
