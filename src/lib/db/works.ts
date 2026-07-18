import { createClient } from "@/lib/supabase/server";
import { toWorkSummary, type WorkSummary } from "@/lib/domain/work";

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
