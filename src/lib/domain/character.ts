import type { Database } from "@/lib/supabase/database.types";

type CharacterRow = Database["public"]["Tables"]["characters"]["Row"];

/** 一覧・編集で扱う登場人物の読みモデル。集約全体ではなく読みモデルとして扱う。 */
export interface CharacterSummary {
  id: string;
  workId: string;
  name: string;
  role: string | null;
  profile: string | null;
  updatedAt: string;
}

/**
 * DB 行をドメイン向けの形へ写す。snake_case を camelCase に寄せ、UI/ドメインが
 * DB スキーマの命名に直接依存しないようにする。
 */
export function toCharacterSummary(row: CharacterRow): CharacterSummary {
  return {
    id: row.id,
    workId: row.work_id,
    name: row.name,
    role: row.role,
    profile: row.profile,
    updatedAt: row.updated_at,
  };
}
