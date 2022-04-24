import { Request } from "./request.ts";
import {
  assertNotEquals,
} from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.136.0/testing/bdd.ts";

describe("Request", () => {
  // Setup
  class TestClass1 extends Request<Promise<number>> {}
  class TestClass2 extends Request<Promise<number>> {}

  describe("requestTypeId", () => {
    it("is unique for each request class", () => {
      assertNotEquals(
        TestClass1.requestTypeId,
        TestClass2.requestTypeId,
      );
    });
  });
});
