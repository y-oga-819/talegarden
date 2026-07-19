"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  createCharacter,
  deleteCharacter,
  updateCharacter,
} from "@/lib/db/characters";
import { characterInputSchema } from "@/lib/validation/character";

export interface CharacterFormState {
  error?: string;
}

function parseCharacterInput(formData: FormData) {
  // role/profile は空文字だと zod の optional に載らないため undefined へ寄せる。
  const rawRole = formData.get("role");
  const rawProfile = formData.get("profile");
  return characterInputSchema.safeParse({
    name: formData.get("name"),
    role: typeof rawRole === "string" && rawRole.length > 0 ? rawRole : undefined,
    profile:
      typeof rawProfile === "string" && rawProfile.length > 0 ? rawProfile : undefined,
  });
}

export async function createCharacterAction(
  _prev: CharacterFormState,
  formData: FormData,
): Promise<CharacterFormState> {
  const workId = formData.get("workId");
  if (typeof workId !== "string" || workId.length === 0) {
    return { error: "対象の作品が不明です" };
  }

  const parsed = parseCharacterInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await createCharacter(workId, parsed.data);

  // 作品詳細のキャラ一覧を無効化してから遷移し、作成直後に反映されるようにする。
  revalidatePath(`/works/${workId}`);
  redirect(`/works/${workId}`);
}

export async function updateCharacterAction(
  _prev: CharacterFormState,
  formData: FormData,
): Promise<CharacterFormState> {
  const workId = formData.get("workId");
  const id = formData.get("id");
  if (typeof workId !== "string" || workId.length === 0) {
    return { error: "対象の作品が不明です" };
  }
  if (typeof id !== "string" || id.length === 0) {
    return { error: "対象の登場人物が不明です" };
  }

  const parsed = parseCharacterInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力が不正です" };
  }

  await updateCharacter(id, parsed.data);

  revalidatePath(`/works/${workId}`);
  redirect(`/works/${workId}`);
}

export async function deleteCharacterAction(formData: FormData): Promise<void> {
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

  await deleteCharacter(id);

  revalidatePath(`/works/${workId}`);
}
