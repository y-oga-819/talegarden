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

  it("accepts an optional synopsis and trims it", () => {
    const parsed = workInputSchema.parse({ title: "月の庭", synopsis: "  導入  " });
    expect(parsed.synopsis).toBe("導入");
  });

  it("accepts input without a synopsis", () => {
    const parsed = workInputSchema.parse({ title: "月の庭" });
    expect(parsed.synopsis).toBeUndefined();
  });
});

describe("volumeInputSchema", () => {
  it("rejects a non-positive volume number", () => {
    expect(
      volumeInputSchema.safeParse({ number: 0, title: "第一巻" }).success,
    ).toBe(false);
  });
});
