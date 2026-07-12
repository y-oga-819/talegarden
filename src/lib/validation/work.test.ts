import { describe, expect, it } from "vitest";

import { volumeInputSchema, workInputSchema } from "./work";

describe("workInputSchema", () => {
  it("trims and accepts a valid title", () => {
    const parsed = workInputSchema.parse({ title: "  月の庭  " });
    expect(parsed.title).toBe("月の庭");
  });

  it("rejects a blank title", () => {
    expect(workInputSchema.safeParse({ title: "   " }).success).toBe(false);
  });
});

describe("volumeInputSchema", () => {
  it("rejects a non-positive volume number", () => {
    expect(
      volumeInputSchema.safeParse({ number: 0, title: "第一巻" }).success,
    ).toBe(false);
  });
});
