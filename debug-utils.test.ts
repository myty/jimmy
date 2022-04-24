import { assertEquals } from "https://deno.land/std@0.136.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.136.0/testing/bdd.ts";
import { spy } from "https://deno.land/std@0.136.0/testing/mock.ts";
import { debug } from "./debug-utils.ts";

describe("debug()", () => {
  it("can log data", () => {
    const consoleLogSpy = spy(console, "log");
    debug("test", { test: 1 });
    assertEquals(consoleLogSpy.calls.length, 4);
    consoleLogSpy.restore();
  });

  describe("when first argument is not a string", () => {
    it("defaults to blank string", () => {
      const consoleLogSpy = spy(console, "log");
      debug({ test: 2 });
      assertEquals(consoleLogSpy.calls.length, 4);
      consoleLogSpy.restore();
    });
  });
});
