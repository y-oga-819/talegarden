import { createClient } from "@/lib/supabase/server";
import {
  nextChapterPosition,
  reorderChapters,
  toChapterDetail,
  toChapterSummary,
  type ChapterDetail,
  type ChapterSummary,
} from "@/lib/domain/chapter";
import { countDocCharacters, type ProseMirrorDoc } from "@/lib/domain/chapterBody";
import type { Json } from "@/lib/supabase/database.types";
import type { ChapterInput } from "@/lib/validation/work";

/**
 * 移動先確定前の一時位置に足すオフセット。実運用で1巻あたりこの数の章になる
 * ことはないため、unique(volume_id, position) と衝突しない退避先として使える。
 */
const MOVE_TEMP_POSITION_OFFSET = 1_000_000;

/**
 * 指定巻に属する章を position の昇順で返す。巻所有者以外は RLS
 * (`chapters_owner_all`) が 0 件に絞るため、ここでは owner 条件を書かない。
 */
export async function listChapters(volumeId: string): Promise<ChapterSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("volume_id", volumeId)
    .order("position", { ascending: true });

  if (error) {
    throw new Error(`章一覧の取得に失敗しました: ${error.message}`);
  }

  return (data ?? []).map(toChapterSummary);
}

/**
 * 編集フォームの初期値用に章を1件返す。他人の章は RLS で 0 件になるため、
 * 見つからない場合は null を返す。
 */
export async function getChapter(id: string): Promise<ChapterSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`章の取得に失敗しました: ${error.message}`);
  }

  return data ? toChapterSummary(data) : null;
}

/**
 * 原稿エディタの初期値用に、本文を含む章を1件返す。他人の章は RLS で 0 件になるため、
 * 見つからない場合は null を返す(getChapter と同じ扱い)。
 */
export async function getChapterDetail(id: string): Promise<ChapterDetail | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chapters")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`章の取得に失敗しました: ${error.message}`);
  }

  return data ? toChapterDetail(data) : null;
}

/**
 * 巻に章を1件追加する。position は既存の末尾+1 をドメインで採番する
 * (volumes.createVolume の number 採番と同じ考え方)。
 */
export async function createChapter(volumeId: string, input: ChapterInput): Promise<void> {
  const supabase = await createClient();

  const { data: existing, error: selectError } = await supabase
    .from("chapters")
    .select("id, position")
    .eq("volume_id", volumeId);

  if (selectError) {
    throw new Error(`章の採番に失敗しました: ${selectError.message}`);
  }

  const { error } = await supabase.from("chapters").insert({
    volume_id: volumeId,
    position: nextChapterPosition(existing ?? []),
    title: input.title,
  });

  if (error) {
    throw new Error(`章の作成に失敗しました: ${error.message}`);
  }
}

/**
 * 章のタイトルを更新する。並び順(position)はこの操作の対象外。
 * owner 制約は RLS が担保するため id 一致のみを条件にする。
 */
export async function updateChapter(id: string, input: ChapterInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("chapters")
    .update({ title: input.title })
    .eq("id", id);

  if (error) {
    throw new Error(`章の更新に失敗しました: ${error.message}`);
  }
}

/**
 * 章の本文(ProseMirror doc)を保存する。文字数(word_count)は本文から算出した値で
 * 常に上書きし、UI から渡された数値は信用しない(表示用の値と保存値がずれないように
 * するため)。算出後の文字数を返し、保存直後の表示に使えるようにする。
 */
export async function updateChapterBody(id: string, doc: ProseMirrorDoc): Promise<number> {
  const supabase = await createClient();
  const wordCount = countDocCharacters(doc);

  const { error } = await supabase
    .from("chapters")
    // jsonb 列へ doc を保存する境界。ProseMirrorDoc は Json と構造的に等価だが
    // content を unknown[] にしているため、ここで一度だけ Json へ寄せる。
    .update({ body: doc as unknown as Json, word_count: wordCount })
    .eq("id", id);

  if (error) {
    throw new Error(`本文の保存に失敗しました: ${error.message}`);
  }

  return wordCount;
}

/** 章を削除する。 */
export async function deleteChapter(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("chapters").delete().eq("id", id);

  if (error) {
    throw new Error(`章の削除に失敗しました: ${error.message}`);
  }
}

/**
 * 章を指定位置へ移動し、巻内の他の章を domain.reorderChapters で 1..n に
 * 振り直す。unique(volume_id, position) は同時更新の途中経過にも効くため、
 * 一度全件を衝突しない一時位置へ退避してから最終位置を確定させる2フェーズ更新にする。
 */
export async function moveChapter(
  volumeId: string,
  chapterId: string,
  targetPosition: number,
): Promise<void> {
  const supabase = await createClient();

  const { data: existing, error: selectError } = await supabase
    .from("chapters")
    .select("id, position")
    .eq("volume_id", volumeId);

  if (selectError) {
    throw new Error(`章の並び替えに失敗しました: ${selectError.message}`);
  }

  const reordered = reorderChapters(existing ?? [], chapterId, targetPosition);

  for (const chapter of reordered) {
    const { error } = await supabase
      .from("chapters")
      .update({ position: chapter.position + MOVE_TEMP_POSITION_OFFSET })
      .eq("id", chapter.id);

    if (error) {
      throw new Error(`章の並び替えに失敗しました: ${error.message}`);
    }
  }

  for (const chapter of reordered) {
    const { error } = await supabase
      .from("chapters")
      .update({ position: chapter.position })
      .eq("id", chapter.id);

    if (error) {
      throw new Error(`章の並び替えに失敗しました: ${error.message}`);
    }
  }
}
