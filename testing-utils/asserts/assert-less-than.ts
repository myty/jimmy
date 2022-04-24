import { AssertionError } from "https://deno.land/std@0.116.0/testing/asserts.ts";

export function assertLessThan(
  actual: number,
  expected: number,
  msg?: string,
): void {
  if (actual >= expected) {
    msg = msg ?? `"${actual}" (actual) expected to be less than "${expected}"`;
    throw new AssertionError(msg);
  }
}
