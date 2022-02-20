import { Notification } from "./notification.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";
import { NotificationHandlerStore } from "./notification-handler-store.ts";

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

Rhum.testPlan("handler", () => {
  Rhum.testSuite("constructor()", () => {
    const store = new NotificationHandlerStore();

    Rhum.testCase("initializes", () => {
      Rhum.asserts.assertEquals(
        store instanceof NotificationHandlerStore,
        true,
      );
    });
  });

  Rhum.testSuite("add()", () => {
    let store: NotificationHandlerStore;
    Rhum.beforeEach(() => {
      store = new NotificationHandlerStore();
    });

    Rhum.testCase("can add NotificationHandlers", () => {
      store.add(TestNotification1, (notification) => {
        notification.test1;
      });
      store.add(TestNotification2, (notification) => {
        notification.test2;
      });
    });

    Rhum.testCase("can add multiple NotificationHandlers for same type", () => {
      store.add(TestNotification1, (notification) => {
        notification.test1;
      });
      store.add(TestNotification1, (notification) => {
        notification.test1;
      });
    });
  });

  Rhum.testSuite("get()", () => {
    let store: NotificationHandlerStore;

    const notificationHandler1 = (notification: TestNotification1) => {
      notification.test1;
    };
    const notificationHandler2 = (notification: TestNotification1) => {
      notification.test1;
    };
    const notificationHandler3 = (notification: TestNotification2) => {
      notification.test2;
    };

    Rhum.beforeEach(() => {
      store = new NotificationHandlerStore();
      store.add(TestNotification1, notificationHandler1);
      store.add(TestNotification1, notificationHandler2);
      store.add(TestNotification2, notificationHandler3);
    });

    Rhum.testCase("returns correct NotificationHandlers", () => {
      const handlers = store.get(new TestNotification1());

      Rhum.asserts.assertEquals(handlers.length, 2);
      Rhum.asserts.assertEquals(handlers, [
        notificationHandler1,
        notificationHandler2,
      ]);

      const handlers2 = store.get(new TestNotification2());

      Rhum.asserts.assertEquals(handlers2.length, 1);
      Rhum.asserts.assertEquals(handlers2, [
        notificationHandler3,
      ]);
    });

    Rhum.testCase("when no register handlers, it returns empty array", () => {
      const handlers = store.get(new TestNotification3());

      Rhum.asserts.assertEquals(handlers.length, 0);
      Rhum.asserts.assertEquals(handlers, []);
    });
  });
});

Rhum.run();
