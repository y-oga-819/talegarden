/**
 * 章の並び順はドメイン層で扱う。「1..n が連続・一意」という不変条件は Volume
 * 集約に属し、永続化前に保証すべきものだから。DB の unique 制約だけでは連続性を
 * 表現できず、UI 側に持たせると UI とサーバで不変条件がずれてしまう。
 */

import type { Database } from "@/lib/supabase/database.types";

type ChapterRow = Database["public"]["Tables"]["chapters"]["Row"];

/** 章一覧に必要な最小の読みモデル。本文(body)は一覧表示では不要なため含めない。 */
export interface ChapterSummary {
  id: string;
  volumeId: string;
  position: number;
  title: string;
  wordCount: number;
  updatedAt: string;
}

/**
 * DB 行をドメイン向けの形へ写す。snake_case を camelCase に寄せ、UI/ドメインが
 * DB スキーマの命名に直接依存しないようにする（volume.toVolumeSummary と対）。
 */
export function toChapterSummary(row: ChapterRow): ChapterSummary {
  return {
    id: row.id,
    volumeId: row.volume_id,
    position: row.position,
    title: row.title,
    wordCount: row.word_count,
    updatedAt: row.updated_at,
  };
}

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
