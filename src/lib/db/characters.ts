import { createClient } from "@/lib/supabase/server";
import {
  toCharacterSummary,
  type CharacterSummary,
} from "@/lib/domain/character";
import type { CharacterInput } from "@/lib/validation/character";

/**
 * 指定作品に属する登場人物を返す。並びは更新の新しい順。作品所有者以外は RLS
 * (`characters_owner_all`) が 0 件に絞るため、ここでは owner 条件を書かない。
 */
export async function listCharacters(workId: string): Promise<CharacterSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("work_id", workId)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`登場人物一覧の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map(toCharacterSummary);
}

/**
 * 編集フォームの初期値用にキャラを1件返す。他人のキャラは RLS で 0 件になるため、
 * 見つからない場合は null を返す。
 */
export async function getCharacter(id: string): Promise<CharacterSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("characters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`登場人物の取得に失敗しました: ${error.message}`);
  }

  return data ? toCharacterSummary(data) : null;
}

/**
 * 作品にキャラを1件追加する。work_id 配下への書き込み可否は RLS の with check が
 * 担保するため、アプリ側では owner を渡さない。
 */
export async function createCharacter(
  workId: string,
  input: CharacterInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("characters").insert({
    work_id: workId,
    name: input.name,
    role: input.role ?? null,
    profile: input.profile ?? null,
  });

  if (error) {
    throw new Error(`登場人物の作成に失敗しました: ${error.message}`);
  }
}

/**
 * キャラの名前・役割・プロフィールを更新する。owner 制約は RLS が担保するため
 * id 一致のみを条件にする。
 */
export async function updateCharacter(
  id: string,
  input: CharacterInput,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("characters")
    .update({
      name: input.name,
      role: input.role ?? null,
      profile: input.profile ?? null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`登場人物の更新に失敗しました: ${error.message}`);
  }
}

/**
 * キャラを削除する。相関図など後続機能はまだこの id を参照していないため、
 * 単純削除で足りる（参照が増えたら FK 側の on delete で整合を取る）。
 */
export async function deleteCharacter(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("characters").delete().eq("id", id);

  if (error) {
    throw new Error(`登場人物の削除に失敗しました: ${error.message}`);
  }
}
