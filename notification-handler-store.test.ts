import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import {
  beforeEach,
  describe,
  it,
} from "https://deno.land/std@0.136.0/testing/bdd.ts";
import { Notification, Request } from "./mod.ts";
import { createHandler } from "./mod.ts";
import { NotificationHandler, RequestHandler } from "./types.ts";
import { NotificationHandlerStore } from "./notification-handler-store.ts";
import { Handler } from "./types.ts";

// Setup
class TestNotification1 extends Notification {
  public test1 = "test1";
}

class TestNotification3 extends Notification {
  public test2 = "test3";
}

describe("NotificationHandlerStore", () => {
  describe("createHandler()", () => {
    describe("notifications", () => {
      // Setup
      class TestNotification extends Notification {
        public test1 = "test";
      }

      const notificationHandler: NotificationHandler<TestNotification> =
        () => {};

      it("returns correct definition type", () => {
        const handlerDefinition = createHandler(
          TestNotification,
          notificationHandler,
        );

        assertEquals(
          TestNotification,
          handlerDefinition.type,
        );
      });

      it("returns correct definition handle", () => {
        const handlerDefinition = createHandler(
          TestNotification,
          notificationHandler,
        );

        assertEquals(
          notificationHandler,
          handlerDefinition.handle,
        );
      });
    });

    describe("requests", () => {
      // Setup
      class TestRequest extends Request {}

      const requestHandler: RequestHandler<TestRequest> = () => {};

      it("returns correct definition type", () => {
        const handlerDefinition = createHandler<TestRequest>(
          TestRequest,
          requestHandler,
        );

        assertEquals(
          TestRequest,
          handlerDefinition.type,
        );
      });

      it("returns correct definition handle", () => {
        const handlerDefinition = createHandler(
          TestRequest,
          requestHandler,
        );

        assertEquals(
          requestHandler,
          handlerDefinition.handle,
        );
      });
    });
  });

  describe("add()", () => {
    // Setup
    const notificationHandlerStore = new NotificationHandlerStore();

    describe("when constructor is not a notification", () => {
      it("throws", () => {
        class NotNotification {}

        assertThrows(
          () =>
            notificationHandlerStore.add(
              NotNotification,
              () => {},
            ),
          Error,
          "Not a valid notification type",
        );
      });
    });

    describe("when adding notification handler", () => {
      it("it is successfule", () => {
        const notificationHandler: NotificationHandler<TestNotification3> =
          () => {};

        notificationHandlerStore.add(
          TestNotification3,
          notificationHandler,
        );

        const foundHandlers = notificationHandlerStore.getMany(
          new TestNotification3(),
        );

        assertEquals(
          [notificationHandler],
          foundHandlers,
        );
      });
    });
  });
});

describe("get()", () => {
  let store: NotificationHandlerStore;
  beforeEach(() => {
    store = new NotificationHandlerStore();
  });

  it("throws", () => {
    assertThrows(() => {
      store.get(new TestNotification1());
    });
  });
});

describe("getMany()", () => {
  let store: NotificationHandlerStore;
  beforeEach(() => {
    store = new NotificationHandlerStore();
  });

  describe("when notification is not notificaton type", () => {
    it("returns empty array", () => {
      class NotNotification {}

      assertEquals(store.getMany(new NotNotification()), []);
    });
  });
});

describe("remove()", () => {
  let store: NotificationHandlerStore;
  beforeEach(() => {
    store = new NotificationHandlerStore();
  });

  it("can remove a NotificationHandler", () => {
    const handler: Handler<TestNotification1> = () => {};
    const notification = new TestNotification1();

    store.add(TestNotification1, handler);
    assertEquals(store.getMany(notification), [handler]);

    store.remove(TestNotification1, handler);
    assertEquals(store.getMany(notification), []);
  });

  it(
    "removing a RequestHandler that is not in store, throws exception",
    () => {
      const handler: Handler<TestNotification1> = () => {};

      assertThrows(() => store.remove(TestNotification1, handler));
    },
  );

  describe("when constructor is not a notification", () => {
    it("throws", () => {
      class NotNotification {}

      assertThrows(
        () =>
          store.remove(
            NotNotification,
            () => {},
          ),
        Error,
        "Not a valid notification type",
      );
    });
  });
});
