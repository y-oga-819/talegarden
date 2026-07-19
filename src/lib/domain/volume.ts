import type { Database } from "@/lib/supabase/database.types";

type VolumeRow = Database["public"]["Tables"]["volumes"]["Row"];

/** 巻一覧に必要な最小の読みモデル。集約全体ではなく読みモデルとして扱う。 */
export interface VolumeSummary {
  id: string;
  workId: string;
  number: number;
  title: string;
  summary: string | null;
  updatedAt: string;
}

/**
 * DB 行をドメイン向けの形へ写す。snake_case を camelCase に寄せ、UI/ドメインが
 * DB スキーマの命名に直接依存しないようにする。
 */
export function toVolumeSummary(row: VolumeRow): VolumeSummary {
  return {
    id: row.id,
    workId: row.work_id,
    number: row.number,
    title: row.title,
    summary: row.summary,
    updatedAt: row.updated_at,
  };
}

/** 採番判定に必要な巻番号だけを持つ最小ビュー。 */
export interface NumberedVolume {
  number: number;
}

/**
 * 作品に巻を追加するときに割り当てる巻番号。「巻番号は 1 始まりで一意」という
 * 不変条件は Work 集約に属するため、DB の default ではなくドメインで決める。
 * 章の position と同じ考え方（chapter.nextChapterPosition と対）。
 */
export function nextVolumeNumber(volumes: readonly NumberedVolume[]): number {
  if (volumes.length === 0) return 1;
  return Math.max(...volumes.map((v) => v.number)) + 1;
}
