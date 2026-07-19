"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createVolume, deleteVolume, updateVolume } from "@/lib/db/volumes";
import { volumeInputSchema } from "@/lib/validation/work";

export interface VolumeFormState {
  error?: string;
}

function parseVolumeInput(formData: FormData) {
  // summary は空文字だと zod の optional に載らないため undefined へ寄せる。
  const rawSummary = formData.get("summary");
  return volumeInputSchema.safeParse({
    title: formData.get("title"),
    summary: typeof rawSummary === "string" && rawSummary.length > 0 ? rawSummary : undefined,
  });
}

export async function createVolumeAction(
  _prev: VolumeFormState,
  formData: FormData,
): Promise<VolumeFormState> {
  const workId = formData.get("workId");
  if (typeof workId !== "string" || workId.length === 0) {
    return { error: "対象の作品が不明です" };
  }

  const parsed = parseVolumeInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await createVolume(workId, parsed.data);

  // 巻一覧のキャッシュを無効化してから遷移し、作成直後に反映されるようにする。
  revalidatePath(`/works/${workId}`);
  redirect(`/works/${workId}`);
}

export async function updateVolumeAction(
  _prev: VolumeFormState,
  formData: FormData,
): Promise<VolumeFormState> {
  const workId = formData.get("workId");
  const id = formData.get("id");
  if (typeof workId !== "string" || workId.length === 0) {
    return { error: "対象の作品が不明です" };
  }
  if (typeof id !== "string" || id.length === 0) {
    return { error: "対象の巻が不明です" };
  }

  const parsed = parseVolumeInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await updateVolume(id, parsed.data);

  revalidatePath(`/works/${workId}`);
  redirect(`/works/${workId}`);
}

export async function deleteVolumeAction(formData: FormData): Promise<void> {
  const workId = formData.get("workId");
  const id = formData.get("id");
  if (
    typeof workId !== "string" ||
    workId.length === 0 ||
    typeof id !== "string" ||
    id.length === 0
  ) {
    // 削除はフォーム送信のみで呼ばれる想定。id 欠落は不正操作なので黙って無視する。
    return;
  }

  await deleteVolume(id);

  revalidatePath(`/works/${workId}`);
}
