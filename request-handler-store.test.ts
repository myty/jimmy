import { Request } from "./request.ts";
import { RequestHandlerStore } from "./request-handler-store.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";
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

Rhum.testPlan("RequestHandlerStore", () => {
  Rhum.testSuite("constructor()", () => {
    const store = new RequestHandlerStore();

    Rhum.testCase("initializes", () => {
      Rhum.asserts.assertEquals(
        store instanceof RequestHandlerStore,
        true,
      );
    });
  });

  Rhum.testSuite("add()", () => {
    let store: RequestHandlerStore;
    Rhum.beforeEach(() => {
      store = new RequestHandlerStore();
    });

    Rhum.testCase("can add RequestHandlers", () => {
      store.add(TestRequest1, (request) => {
        request.test1;
      });
      store.add(TestRequest2, (request) => {
        return request.test2;
      });
    });

    Rhum.testCase(
      "multiple RequestHandlers for same type, throws exception",
      () => {
        store.add(TestRequest1, (request) => {
          request.test1;
        });
        Rhum.asserts.assertThrows(() => {
          store.add(TestRequest1, (request) => {
            request.test1;
          });
        });
      },
    );
  });

  Rhum.testSuite("get()", () => {
    let store: RequestHandlerStore;

    const requestHandler1 = (request: TestRequest1) => {
      request.test1;
    };

    const requestHandler2 = (request: TestRequest2) => {
      return request.test2;
    };

    Rhum.beforeEach(() => {
      store = new RequestHandlerStore();
      store.add(TestRequest1, requestHandler1);
      store.add(TestRequest2, requestHandler2);
    });

    Rhum.testCase("returns correct RequestHandler", () => {
      const handler = store.get(new TestRequest1());
      Rhum.asserts.assertExists(handler);

      const handler2 = store.get(new TestRequest2());
      Rhum.asserts.assertExists(handler2);
    });

    Rhum.testCase("when no registered handlers, it returns empty array", () => {
      Rhum.asserts.assertThrows(() => {
        store.get(new TestRequest3());
      });
    });
  });

  Rhum.testSuite("remove()", () => {
    let store: RequestHandlerStore;
    Rhum.beforeEach(() => {
      store = new RequestHandlerStore();
    });

    Rhum.testCase("can remove a RequestHandler", () => {
      const handler: Handler<TestRequest1> = (request) => {
        request.test1;
      };
      const request = new TestRequest1();

      store.add(TestRequest1, handler);
      const foundHandler = store.get(request);

      Rhum.asserts.assertEquals(foundHandler, handler);

      store.remove(TestRequest1, handler);

      Rhum.asserts.assertThrows(() => store.get(request));
    });

    Rhum.testCase(
      "removing a RequestHandler that is not in store, throws exception",
      () => {
        const handler: Handler<TestRequest1> = (request) => {
          request.test1;
        };

        Rhum.asserts.assertThrows(() => store.remove(TestRequest1, handler));
      },
    );
  });
});

Rhum.run();
