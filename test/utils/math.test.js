import { describe, expect, it } from "vitest";
import { add, mul } from "../../src/utils/math.js";

describe("math utils", () => {
  it("adds numbers", () => {
    expect(add(1, 2)).toBe(3);
  });

  it("multiplies numbers", () => {
    expect(mul(2, 3)).toBe(6);
  });
});
