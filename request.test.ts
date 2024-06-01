import { Request } from "./request.ts";
import { assertNotEquals } from "jsr:@std/assert";
import { describe, test } from "@std/testing/bdd";

describe("Request", () => {
  // Setup
  class TestClass1 extends Request<Promise<number>> {}
  class TestClass2 extends Request<Promise<number>> {}

  describe("requestTypeId", () => {
    test("is unique for each request class", () => {
      assertNotEquals(
        TestClass1.requestTypeId,
        TestClass2.requestTypeId,
      );
    });
  });
});
