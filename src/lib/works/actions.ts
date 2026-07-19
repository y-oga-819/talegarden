"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createWork, deleteWork, updateWork } from "@/lib/db/works";
import { workInputSchema } from "@/lib/validation/work";

export interface WorkFormState {
  error?: string;
}

function parseWorkInput(formData: FormData) {
  // synopsis は空文字だと zod の optional に載らないため undefined へ寄せる。
  const rawSynopsis = formData.get("synopsis");
  return workInputSchema.safeParse({
    title: formData.get("title"),
    synopsis: typeof rawSynopsis === "string" && rawSynopsis.length > 0 ? rawSynopsis : undefined,
  });
}

export async function createWorkAction(
  _prev: WorkFormState,
  formData: FormData,
): Promise<WorkFormState> {
  const parsed = parseWorkInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await createWork(parsed.data);

  // 一覧のキャッシュを無効化してから遷移し、作成直後に反映されるようにする。
  revalidatePath("/works");
  redirect("/works");
}

export async function updateWorkAction(
  _prev: WorkFormState,
  formData: FormData,
): Promise<WorkFormState> {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    return { error: "対象の作品が不明です" };
  }

  const parsed = parseWorkInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await updateWork(id, parsed.data);

  revalidatePath("/works");
  redirect("/works");
}

export async function deleteWorkAction(formData: FormData): Promise<void> {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) {
    // 削除はフォーム送信のみで呼ばれる想定。id 欠落は不正操作なので黙って無視する。
    return;
  }

  await deleteWork(id);

  revalidatePath("/works");
}
