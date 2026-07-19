import { describe, expect, it } from "vitest";

import {
  hasContiguousPositions,
  nextChapterPosition,
  reorderChapters,
  toChapterSummary,
  type OrderedChapter,
} from "./chapter";

const chapters: OrderedChapter[] = [
  { id: "a", position: 1 },
  { id: "b", position: 2 },
  { id: "c", position: 3 },
];

describe("toChapterSummary", () => {
  it("maps snake_case DB rows to a camelCase read model", () => {
    const summary = toChapterSummary({
      id: "c1",
      volume_id: "v1",
      position: 2,
      title: "第二章",
      body: {},
      word_count: 1200,
      created_at: "2026-07-01T00:00:00Z",
      updated_at: "2026-07-05T00:00:00Z",
    });

    expect(summary).toEqual({
      id: "c1",
      volumeId: "v1",
      position: 2,
      title: "第二章",
      wordCount: 1200,
      updatedAt: "2026-07-05T00:00:00Z",
    });
  });
});

describe("nextChapterPosition", () => {
  it("starts numbering at 1 for an empty volume", () => {
    expect(nextChapterPosition([])).toBe(1);
  });

  it("appends after the current highest position", () => {
    expect(nextChapterPosition(chapters)).toBe(4);
  });
});

describe("reorderChapters", () => {
  it("moves a chapter forward and renumbers contiguously", () => {
    const result = reorderChapters(chapters, "c", 1);
    expect(result.map((c) => c.id)).toEqual(["c", "a", "b"]);
    expect(result.map((c) => c.position)).toEqual([1, 2, 3]);
  });

  it("moves a chapter backward and renumbers contiguously", () => {
    const result = reorderChapters(chapters, "a", 3);
    expect(result.map((c) => c.id)).toEqual(["b", "c", "a"]);
    expect(result.map((c) => c.position)).toEqual([1, 2, 3]);
  });

  it("clamps an out-of-range target to the last slot", () => {
    const result = reorderChapters(chapters, "a", 99);
    expect(result.map((c) => c.id)).toEqual(["b", "c", "a"]);
  });

  it("throws when the chapter does not belong to the volume", () => {
    expect(() => reorderChapters(chapters, "missing", 1)).toThrow();
  });
});

describe("hasContiguousPositions", () => {
  it("accepts a contiguous 1..n sequence", () => {
    expect(hasContiguousPositions(chapters)).toBe(true);
  });

  it("rejects gaps in the sequence", () => {
    expect(
      hasContiguousPositions([
        { id: "a", position: 1 },
        { id: "b", position: 3 },
      ]),
    ).toBe(false);
  });
});
