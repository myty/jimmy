import { Request } from "./request.ts";
import { RequestHandlerStore } from "./request-handler-store.ts";
import { assertEquals, assertExists, assertThrows } from "@std/assert";
import { beforeEach, describe, test } from "@std/testing/bdd";
import { Handler } from "./types.ts";

// Setup
class TestRequest1 extends Request {
  public test1 = "test1";
}

class TestRequest2 extends Request<string> {
  public test2 = "test2";
}

class TestRequest3 extends Request {
  public test2 = "test3";
}

describe("RequestHandlerStore", () => {
  describe("constructor()", () => {
    const store = new RequestHandlerStore();

    test("initializes", () => {
      assertEquals(
        store instanceof RequestHandlerStore,
        true,
      );
    });
  });

  describe("add()", () => {
    let store: RequestHandlerStore;
    beforeEach(() => {
      store = new RequestHandlerStore();
    });

    test("can add RequestHandlers", () => {
      store.add(TestRequest1, (request) => {
        request.test1;
      });
      store.add(TestRequest2, (request) => {
        return request.test2;
      });
    });

    test(
      "multiple RequestHandlers for same type, throws exception",
      () => {
        store.add(TestRequest1, (request) => {
          request.test1;
        });
        assertThrows(() => {
          store.add(TestRequest1, (request) => {
            request.test1;
          });
        });
      },
    );
  });

  describe("get()", () => {
    let store: RequestHandlerStore;

    const requestHandler1 = (request: TestRequest1) => {
      request.test1;
    };

    const requestHandler2 = (request: TestRequest2) => {
      return request.test2;
    };

    beforeEach(() => {
      store = new RequestHandlerStore();
      store.add(TestRequest1, requestHandler1);
      store.add(TestRequest2, requestHandler2);
    });

    test("returns correct RequestHandler", () => {
      const handler = store.get(new TestRequest1());
      assertExists(handler);

      const handler2 = store.get(new TestRequest2());
      assertExists(handler2);
    });

    test("when no registered handlers, it returns empty array", () => {
      assertThrows(() => {
        store.get(new TestRequest3());
      });
    });
  });

  describe("remove()", () => {
    let store: RequestHandlerStore;
    beforeEach(() => {
      store = new RequestHandlerStore();
    });

    test("can remove a RequestHandler", () => {
      const handler: Handler<TestRequest1> = (request) => {
        request.test1;
      };
      const request = new TestRequest1();

      store.add(TestRequest1, handler);
      const foundHandler = store.get(request);

      assertEquals(foundHandler, handler);

      store.remove(TestRequest1, handler);

      assertThrows(() => store.get(request));
    });

    test(
      "removing a RequestHandler that is not in store, throws exception",
      () => {
        const handler: Handler<TestRequest1> = (request) => {
          request.test1;
        };

        assertThrows(() => store.remove(TestRequest1, handler));
      },
    );
  });
});
