import { Request } from "./request.ts";
import {
  assertNotEquals,
} from "https://deno.land/std@0.122.0/testing/asserts.ts";

Deno.test("Request", async (t) => {
  // Setup
  class TestClass1 extends Request<Promise<number>> {}
  class TestClass2 extends Request<Promise<number>> {}

  await t.step("requestTypeId is unique for each request class", () => {
    assertNotEquals(TestClass1.requestTypeId, TestClass2.requestTypeId);
  });
});
