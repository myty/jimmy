import { assertLessThan, delayAsync } from "./index.ts";
import { describe, it } from "https://deno.land/std@0.136.0/testing/bdd.ts";

describe("delayAsync()", () => {
  describe("when provided a value", () => {
    it("runs successfully", async () => {
      await delayAsync(1);
    });

    it("delays", async () => {
      const delayMs = 400 + (100 * Math.random());

      const start = Date.now();
      await delayAsync(delayMs);
      const end = Date.now();

      assertLessThan(end - start, delayMs + 10);
    });
  });

  describe("when abort controller signal is already aborted", () => {
    it("resolves immediately", async () => {
      const delayMs = 400 + (100 * Math.random());
      const abortController = new AbortController();

      const start = Date.now();
      abortController.abort();
      await delayAsync(delayMs, abortController.signal);
      const end = Date.now();

      assertLessThan(end - start, 10);
    });
  });

  describe("when abort controller signal is aborted", () => {
    it("cancels", async () => {
      const delayMs = 400 + (100 * Math.random());
      const abortController = new AbortController();

      const start = Date.now();
      const delayPromise = delayAsync(delayMs, abortController.signal);
      abortController.abort();
      await delayPromise;
      const end = Date.now();

      assertLessThan(end - start, 10);
    });
  });
});
