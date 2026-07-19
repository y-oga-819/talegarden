import { describe, expect, it } from "vitest";

import { nextVolumeNumber, toVolumeSummary } from "./volume";

describe("toVolumeSummary", () => {
  it("maps snake_case DB rows to a camelCase read model", () => {
    const summary = toVolumeSummary({
      id: "v1",
      work_id: "w1",
      number: 2,
      title: "第二巻",
      summary: "反攻",
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-05T00:00:00Z",
    });

    expect(summary).toEqual({
      id: "v1",
      workId: "w1",
      number: 2,
      title: "第二巻",
      summary: "反攻",
      updatedAt: "2026-07-05T00:00:00Z",
    });
  });

  it("keeps a null summary as null (未設定を空文字に潰さない)", () => {
    const summary = toVolumeSummary({
      id: "v2",
      work_id: "w1",
      number: 1,
      title: "第一巻",
      summary: null,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-01T00:00:00Z",
    });

    expect(summary.summary).toBeNull();
  });
});

describe("nextVolumeNumber", () => {
  it("starts at 1 when there are no volumes yet", () => {
    expect(nextVolumeNumber([])).toBe(1);
  });

  it("returns one past the highest existing number", () => {
    expect(nextVolumeNumber([{ number: 1 }, { number: 3 }])).toBe(4);
  });
});
