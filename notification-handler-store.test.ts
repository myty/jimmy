import { Notification } from "./notification.ts";
import { assertEquals, assertThrows } from "jsr:@std/assert";
import { beforeEach, describe, test } from "@std/testing/bdd";
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

describe("NotificationHandlerStore", () => {
  describe("constructor()", () => {
    const store = new NotificationHandlerStore();

    test("initializes", () => {
      assertEquals(
        store instanceof NotificationHandlerStore,
        true,
      );
    });
  });

  describe("add()", () => {
    let store: NotificationHandlerStore;
    beforeEach(() => {
      store = new NotificationHandlerStore();
    });

    test("can add NotificationHandlers", () => {
      store.add(TestNotification1, (notification) => {
        notification.test1;
      });
      store.add(TestNotification2, (notification) => {
        notification.test2;
      });
    });

    test("can add multiple NotificationHandlers for same type", () => {
      store.add(TestNotification1, (notification) => {
        notification.test1;
      });
      store.add(TestNotification1, (notification) => {
        notification.test1;
      });
    });
  });

  describe("get()", () => {
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

    beforeEach(() => {
      store = new NotificationHandlerStore();
      store.add(TestNotification1, notificationHandler1);
      store.add(TestNotification1, notificationHandler2);
      store.add(TestNotification2, notificationHandler3);
    });

    test("returns correct NotificationHandlers", () => {
      const handlers = store.get(new TestNotification1());

      assertEquals(handlers.length, 2);
      assertEquals(handlers, [
        notificationHandler1,
        notificationHandler2,
      ]);

      const handlers2 = store.get(new TestNotification2());

      assertEquals(handlers2.length, 1);
      assertEquals(handlers2, [
        notificationHandler3,
      ]);
    });

    test("when no register handlers, it returns empty array", () => {
      const handlers = store.get(new TestNotification3());

      assertEquals(handlers.length, 0);
      assertEquals(handlers, []);
    });
  });

  describe("remove()", () => {
    let store: NotificationHandlerStore;
    beforeEach(() => {
      store = new NotificationHandlerStore();
    });

    test("can remove a NotificationHandler", () => {
      const handler: Handler<TestNotification1> = () => {};
      const notification = new TestNotification1();

      store.add(TestNotification1, handler);
      assertEquals(store.get(notification), [handler]);

      store.remove(TestNotification1, handler);
      assertEquals(store.get(notification), []);
    });

    test(
      "removing a RequestHandler that is not in store, throws exception",
      () => {
        const handler: Handler<TestNotification1> = () => {};

        assertThrows(() => store.remove(TestNotification1, handler));
      },
    );
  });
});
