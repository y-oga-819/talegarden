import { describe, expect, it } from "vitest";

import { chapterInputSchema, volumeInputSchema, workInputSchema } from "./work";

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
  it("trims and accepts a valid title", () => {
    const parsed = volumeInputSchema.parse({ title: "  第一巻  " });
    expect(parsed.title).toBe("第一巻");
  });

  it("rejects a blank title", () => {
    expect(volumeInputSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("accepts an optional summary and trims it", () => {
    const parsed = volumeInputSchema.parse({ title: "第一巻", summary: "  起  " });
    expect(parsed.summary).toBe("起");
  });
});

describe("chapterInputSchema", () => {
  it("trims and accepts a valid title", () => {
    const parsed = chapterInputSchema.parse({ title: "  第一章  " });
    expect(parsed.title).toBe("第一章");
  });

  it("rejects a blank title", () => {
    expect(chapterInputSchema.safeParse({ title: "   " }).success).toBe(false);
  });
});
