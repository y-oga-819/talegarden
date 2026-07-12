/**
 * 章の並び順はドメイン層で扱う。「1..n が連続・一意」という不変条件は Volume
 * 集約に属し、永続化前に保証すべきものだから。DB の unique 制約だけでは連続性を
 * 表現できず、UI 側に持たせると UI とサーバで不変条件がずれてしまう。
 */

export interface OrderedChapter {
  id: string;
  position: number;
}

/** 巻の末尾に章を追加するときに割り当てる position。 */
export function nextChapterPosition(chapters: readonly OrderedChapter[]): number {
  if (chapters.length === 0) return 1;
  return Math.max(...chapters.map((c) => c.position)) + 1;
}

/**
 * 章を 1 始まりの指定位置へ移動し、他の章の相対順序を保ったまま 1..n の連続列に
 * 振り直した全体を返す。
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

/** position が重複なく 1..n の連続列になっていれば true。 */
export function hasContiguousPositions(chapters: readonly OrderedChapter[]): boolean {
  const positions = chapters.map((c) => c.position).sort((a, b) => a - b);
  return positions.every((position, index) => position === index + 1);
}
