"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { CharacterFormState } from "@/lib/characters/actions";

const initialState: CharacterFormState = {};

interface CharacterFormProps {
  action: (prev: CharacterFormState, formData: FormData) => Promise<CharacterFormState>;
  submitLabel: string;
  workId: string;
  characterId?: string;
  defaultValues?: { name: string; role: string; profile: string };
}

export function CharacterForm({
  action,
  submitLabel,
  workId,
  characterId,
  defaultValues,
}: CharacterFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="workId" value={workId} />
      {characterId ? <input type="hidden" name="id" value={characterId} /> : null}

      <label className="flex flex-col gap-1 text-sm">
        名前
        <input
          name="name"
          type="text"
          required
          maxLength={200}
          autoFocus
          defaultValue={defaultValues?.name ?? ""}
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        役割（任意）
        <input
          name="role"
          type="text"
          maxLength={200}
          placeholder="主人公 / 敵役 / 語り手 など"
          defaultValue={defaultValues?.role ?? ""}
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        プロフィール（任意）
        <textarea
          name="profile"
          rows={6}
          maxLength={4000}
          defaultValue={defaultValues?.profile ?? ""}
          className="rounded-md border border-black/15 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {submitLabel}
        </button>
        <Link
          href={`/works/${workId}`}
          className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
