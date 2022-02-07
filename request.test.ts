import { Request } from "./request.ts";
import { Rhum } from "https://deno.land/x/rhum@v1.1.12/mod.ts";

Rhum.testPlan("Request", () => {
  // Setup
  class TestClass1 extends Request<Promise<number>> {}
  class TestClass2 extends Request<Promise<number>> {}

  Rhum.testSuite("requestTypeId", () => {
    Rhum.testCase("is unique for each request class", () => {
      Rhum.asserts.assertNotEquals(
        TestClass1.requestTypeId,
        TestClass2.requestTypeId,
      );
    });
  });
});

Rhum.run();
