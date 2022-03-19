import {
  AssertionError,
  assertThrows,
} from "https://deno.land/std@0.116.0/testing/asserts.ts";
import { assertLessThan } from "./assert-less-than.ts";

Deno.test("when actual is less than expected, it runs without error", () => {
  assertLessThan(1, 2);
});

Deno.test("when actual is not less than expected, it throws error", () => {
  assertThrows(() => assertLessThan(2, 1));
});

Deno.test("when actual is not less than expected and provided custom error message, it throws error with message", () => {
  const msg = "custom error message";
  assertThrows(() => assertLessThan(2, 1, msg), AssertionError, msg);
});
