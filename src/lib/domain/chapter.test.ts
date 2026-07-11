import { describe, expect, it } from "vitest";

import {
  hasContiguousPositions,
  nextChapterPosition,
  reorderChapters,
  type OrderedChapter,
} from "./chapter";

const chapters: OrderedChapter[] = [
  { id: "a", position: 1 },
  { id: "b", position: 2 },
  { id: "c", position: 3 },
];

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
