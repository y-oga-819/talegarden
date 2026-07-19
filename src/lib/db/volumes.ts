import { createClient } from "@/lib/supabase/server";
import {
  nextVolumeNumber,
  toVolumeSummary,
  type VolumeSummary,
} from "@/lib/domain/volume";
import type { VolumeInput } from "@/lib/validation/work";

/**
 * 指定作品に属する巻を巻番号の昇順で返す。作品所有者以外は RLS
 * (`volumes_owner_all`) が 0 件に絞るため、ここでは owner 条件を書かない。
 */
export async function listVolumes(workId: string): Promise<VolumeSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("volumes")
    .select("*")
    .eq("work_id", workId)
    .order("number", { ascending: true });

  if (error) {
    throw new Error(`巻一覧の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map(toVolumeSummary);
}

/**
 * 編集フォームの初期値用に巻を1件返す。他人の巻は RLS で 0 件になるため、
 * 見つからない場合は null を返す。
 */
export async function getVolume(id: string): Promise<VolumeSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("volumes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`巻の取得に失敗しました: ${error.message}`);
  }

  return data ? toVolumeSummary(data) : null;
}

/**
 * 作品に巻を1件追加する。巻番号は既存の末尾+1 をドメインで採番する。
 * 楽観的採番なので同時追加では衝突しうるが、その最終防波堤は
 * unique(work_id, number) 制約に委ね、通常運用（単一ユーザーの逐次操作）を優先する。
 */
export async function createVolume(workId: string, input: VolumeInput): Promise<void> {
  const supabase = await createClient();

  const { data: existing, error: selectError } = await supabase
    .from("volumes")
    .select("number")
    .eq("work_id", workId);

  if (selectError) {
    throw new Error(`巻番号の採番に失敗しました: ${selectError.message}`);
  }

  const { error } = await supabase.from("volumes").insert({
    work_id: workId,
    number: nextVolumeNumber(existing ?? []),
    title: input.title,
    summary: input.summary ?? null,
  });

  if (error) {
    throw new Error(`巻の作成に失敗しました: ${error.message}`);
  }
}

/**
 * 巻のタイトル・概要を更新する。巻番号（並び替え）はこの操作の対象外。
 * owner 制約は RLS が担保するため id 一致のみを条件にする。
 */
export async function updateVolume(id: string, input: VolumeInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("volumes")
    .update({
      title: input.title,
      summary: input.summary ?? null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`巻の更新に失敗しました: ${error.message}`);
  }
}

/**
 * 巻を削除する。chapters は FK の on delete cascade で連鎖削除される。
 */
export async function deleteVolume(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("volumes").delete().eq("id", id);

  if (error) {
    throw new Error(`巻の削除に失敗しました: ${error.message}`);
  }
}
