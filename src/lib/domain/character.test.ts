import { describe, expect, it } from "vitest";

import { toCharacterSummary } from "./character";

describe("toCharacterSummary", () => {
  it("maps snake_case DB rows to a camelCase read model", () => {
    const summary = toCharacterSummary({
      id: "c1",
      work_id: "w1",
      name: "月島 灯",
      role: "主人公",
      profile: "庭を継いだ少女",
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-05T00:00:00Z",
    });

    expect(summary).toEqual({
      id: "c1",
      workId: "w1",
      name: "月島 灯",
      role: "主人公",
      profile: "庭を継いだ少女",
      updatedAt: "2026-07-05T00:00:00Z",
    });
  });

  it("keeps null role/profile as null (未設定を空文字に潰さない)", () => {
    const summary = toCharacterSummary({
      id: "c2",
      work_id: "w1",
      name: "名無し",
      role: null,
      profile: null,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    });

    expect(summary.role).toBeNull();
    expect(summary.profile).toBeNull();
  });
});
