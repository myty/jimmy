import { assertLessThan, delayAsync } from "./index.ts";

Deno.test("when provided a delay value, delayAsync runs", async () => {
  await delayAsync(1);
});

Deno.test("when provided a delay value, delayAsync delays", async () => {
  const delayMs = 400 + (100 * Math.random());

  const start = Date.now();
  await delayAsync(delayMs);
  const end = Date.now();

  assertLessThan(end - start, delayMs + 10);
});

Deno.test("when abort controller signal is already aborted, delayAsync resolves immediately", async () => {
  const delayMs = 400 + (100 * Math.random());
  const abortController = new AbortController();

  const start = Date.now();
  abortController.abort();
  await delayAsync(delayMs, abortController.signal);
  const end = Date.now();

  assertLessThan(end - start, 10);
});

Deno.test("when abort controller signal is aborted, delayAsync cancels", async () => {
  const delayMs = 400 + (100 * Math.random());
  const abortController = new AbortController();

  const start = Date.now();
  const delayPromise = delayAsync(delayMs, abortController.signal);
  abortController.abort();
  await delayPromise;
  const end = Date.now();

  assertLessThan(end - start, 10);
});
