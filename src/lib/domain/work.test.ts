import { describe, expect, it } from "vitest";

import { toWorkSummary } from "./work";

describe("toWorkSummary", () => {
  it("maps snake_case DB rows to a camelCase read model", () => {
    const summary = toWorkSummary({
      id: "w1",
      owner_id: "u1",
      title: "銀の庭",
      synopsis: "序章のあらすじ",
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-05T00:00:00Z",
    });

    expect(summary).toEqual({
      id: "w1",
      title: "銀の庭",
      synopsis: "序章のあらすじ",
      updatedAt: "2026-07-05T00:00:00Z",
    });
  });

  it("keeps a null synopsis as null (未設定を空文字に潰さない)", () => {
    const summary = toWorkSummary({
      id: "w2",
      owner_id: "u1",
      title: "無題",
      synopsis: null,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    });

    expect(summary.synopsis).toBeNull();
  });
});
