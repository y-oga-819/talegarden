"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createChapter,
  deleteChapter,
  moveChapter,
  updateChapter,
  updateChapterBody,
} from "@/lib/db/chapters";
import { chapterBodyInputSchema, chapterInputSchema } from "@/lib/validation/work";

export interface ChapterFormState {
  error?: string;
}

export interface ChapterBodyFormState {
  error?: string;
  // 保存成功時のみ設定する。エディタに留まったまま結果を表示するために使う。
  // savedText は「保存後に本文が編集されたか」をクライアントが差分で判定するための基準。
  savedText?: string;
  wordCount?: number;
}

function parseChapterInput(formData: FormData) {
  return chapterInputSchema.safeParse({
    title: formData.get("title"),
  });
}

function volumePath(workId: string, volumeId: string): string {
  return `/works/${workId}/volumes/${volumeId}`;
}

export async function createChapterAction(
  _prev: ChapterFormState,
  formData: FormData,
): Promise<ChapterFormState> {
  const workId = formData.get("workId");
  const volumeId = formData.get("volumeId");
  if (typeof workId !== "string" || workId.length === 0) {
    return { error: "対象の作品が不明です" };
  }
  if (typeof volumeId !== "string" || volumeId.length === 0) {
    return { error: "対象の巻が不明です" };
  }

  const parsed = parseChapterInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await createChapter(volumeId, parsed.data);

  // 章一覧のキャッシュを無効化してから遷移し、作成直後に反映されるようにする。
  revalidatePath(volumePath(workId, volumeId));
  redirect(volumePath(workId, volumeId));
}

export async function updateChapterAction(
  _prev: ChapterFormState,
  formData: FormData,
): Promise<ChapterFormState> {
  const workId = formData.get("workId");
  const volumeId = formData.get("volumeId");
  const id = formData.get("id");
  if (typeof workId !== "string" || workId.length === 0) {
    return { error: "対象の作品が不明です" };
  }
  if (typeof volumeId !== "string" || volumeId.length === 0) {
    return { error: "対象の巻が不明です" };
  }
  if (typeof id !== "string" || id.length === 0) {
    return { error: "対象の章が不明です" };
  }

  const parsed = parseChapterInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await updateChapter(id, parsed.data);

  revalidatePath(volumePath(workId, volumeId));
  redirect(volumePath(workId, volumeId));
}

export async function updateChapterBodyAction(
  _prev: ChapterBodyFormState,
  formData: FormData,
): Promise<ChapterBodyFormState> {
  const workId = formData.get("workId");
  const volumeId = formData.get("volumeId");
  const id = formData.get("id");
  if (typeof workId !== "string" || workId.length === 0) {
    return { error: "対象の作品が不明です" };
  }
  if (typeof volumeId !== "string" || volumeId.length === 0) {
    return { error: "対象の巻が不明です" };
  }
  if (typeof id !== "string" || id.length === 0) {
    return { error: "対象の章が不明です" };
  }

  const parsed = chapterBodyInputSchema.safeParse({ body: formData.get("body") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  const wordCount = await updateChapterBody(id, parsed.data.body);

  // 執筆を中断させないよう遷移はせず、エディタに留めたまま結果を返す。文字数は巻の章一覧に
  // も出るため、そちらのキャッシュだけ無効化しておく。
  revalidatePath(volumePath(workId, volumeId));
  return { savedText: parsed.data.body, wordCount };
}

export async function deleteChapterAction(formData: FormData): Promise<void> {
  const workId = formData.get("workId");
  const volumeId = formData.get("volumeId");
  const id = formData.get("id");
  if (
    typeof workId !== "string" ||
    workId.length === 0 ||
    typeof volumeId !== "string" ||
    volumeId.length === 0 ||
    typeof id !== "string" ||
    id.length === 0
  ) {
    // 削除はフォーム送信のみで呼ばれる想定。id 欠落は不正操作なので黙って無視する。
    return;
  }

  await deleteChapter(id);

  revalidatePath(volumePath(workId, volumeId));
}

export async function moveChapterAction(formData: FormData): Promise<void> {
  const workId = formData.get("workId");
  const volumeId = formData.get("volumeId");
  const id = formData.get("id");
  const currentPosition = formData.get("currentPosition");
  const direction = formData.get("direction");

  if (
    typeof workId !== "string" ||
    workId.length === 0 ||
    typeof volumeId !== "string" ||
    volumeId.length === 0 ||
    typeof id !== "string" ||
    id.length === 0 ||
    typeof currentPosition !== "string" ||
    (direction !== "up" && direction !== "down")
  ) {
    return;
  }

  const position = Number(currentPosition);
  const targetPosition = direction === "up" ? position - 1 : position + 1;

  await moveChapter(volumeId, id, targetPosition);

  revalidatePath(volumePath(workId, volumeId));
}
