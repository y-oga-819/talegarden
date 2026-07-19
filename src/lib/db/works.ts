import { createClient } from "@/lib/supabase/server";
import { toWorkSummary, type WorkSummary } from "@/lib/domain/work";
import type { WorkInput } from "@/lib/validation/work";

/**
 * ログイン中の利用者が所有する作品の一覧を返す。owner での絞り込みは RLS
 * (`works_owner_all`) が担保するため、ここでは明示的な owner_id 条件を書かない。
 * こうすることで「所有者以外は取得できない」不変条件を DB 側に一元化できる。
 */
export async function listWorks(): Promise<WorkSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`作品一覧の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map(toWorkSummary);
}

/**
 * 作品を1件作成する。owner_id は列のデフォルト `auth.uid()` に委ね、ここでは
 * 渡さない。アプリ側でセッションの id を取り回すより、DB が JWT から決める方が
 * RLS の `with check (owner_id = auth.uid())` と食い違わず安全だから。
 */
export async function createWork(input: WorkInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("works").insert({
    title: input.title,
    synopsis: input.synopsis ?? null,
  });

  if (error) {
    throw new Error(`作品の作成に失敗しました: ${error.message}`);
  }
}

/**
 * 編集フォームの初期値用に作品を1件返す。owner 以外の行は RLS で 0 件になるため、
 * 見つからない場合は null を返す（他人の作品への到達も同じく null に落ちる）。
 */
export async function getWork(id: string): Promise<WorkSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("works")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`作品の取得に失敗しました: ${error.message}`);
  }

  return data ? toWorkSummary(data) : null;
}

/**
 * 作品を更新する。owner 制約は RLS が担保するため id 一致のみを条件にする。
 */
export async function updateWork(id: string, input: WorkInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("works")
    .update({
      title: input.title,
      synopsis: input.synopsis ?? null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`作品の更新に失敗しました: ${error.message}`);
  }
}

/**
 * 作品を削除する。volumes/chapters は FK の on delete cascade で連鎖削除される。
 */
export async function deleteWork(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("works").delete().eq("id", id);

  if (error) {
    throw new Error(`作品の削除に失敗しました: ${error.message}`);
  }
}
