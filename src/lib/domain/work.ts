import type { Database } from "@/lib/supabase/database.types";

type WorkRow = Database["public"]["Tables"]["works"]["Row"];

/** 一覧表示に必要な最小の作品ビュー。集約全体ではなく読みモデルとして扱う。 */
export interface WorkSummary {
  id: string;
  title: string;
  synopsis: string | null;
  updatedAt: string;
}

/**
 * DB 行をドメイン向けの形へ写す。snake_case を camelCase に寄せ、UI/ドメインが
 * DB スキーマの命名に直接依存しないようにする。
 */
export function toWorkSummary(row: WorkRow): WorkSummary {
  return {
    id: row.id,
    title: row.title,
    synopsis: row.synopsis,
    updatedAt: row.updated_at,
  };
}
