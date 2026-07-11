/**
 * Chapter ordering lives in the domain layer rather than in SQL because the
 * "1..n contiguous, unique position" invariant belongs to the Volume aggregate
 * and must hold before anything is persisted. A DB unique constraint alone
 * cannot express contiguity, and doing it client-side would let the invariant
 * drift between UI and server.
 */

export interface OrderedChapter {
  id: string;
  position: number;
}

/** Position to assign to a chapter appended at the end of a volume. */
export function nextChapterPosition(chapters: readonly OrderedChapter[]): number {
  if (chapters.length === 0) return 1;
  return Math.max(...chapters.map((c) => c.position)) + 1;
}

/**
 * Move a chapter to a new 1-based slot and return the full set renumbered to a
 * contiguous 1..n sequence, preserving the relative order of the others.
 */
export function reorderChapters(
  chapters: readonly OrderedChapter[],
  chapterId: string,
  targetPosition: number,
): OrderedChapter[] {
  const ordered = [...chapters].sort((a, b) => a.position - b.position);
  const fromIndex = ordered.findIndex((c) => c.id === chapterId);
  if (fromIndex === -1) {
    throw new Error(`chapter ${chapterId} not found in volume`);
  }

  const clampedTarget = Math.min(Math.max(targetPosition, 1), ordered.length);
  const [moved] = ordered.splice(fromIndex, 1);
  ordered.splice(clampedTarget - 1, 0, moved);

  return ordered.map((chapter, index) => ({ ...chapter, position: index + 1 }));
}

/** True when positions form a contiguous 1..n sequence with no duplicates. */
export function hasContiguousPositions(chapters: readonly OrderedChapter[]): boolean {
  const positions = chapters.map((c) => c.position).sort((a, b) => a - b);
  return positions.every((position, index) => position === index + 1);
}
