"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { ChapterFormState } from "@/lib/chapters/actions";

const initialState: ChapterFormState = {};

interface ChapterFormProps {
  action: (prev: ChapterFormState, formData: FormData) => Promise<ChapterFormState>;
  submitLabel: string;
  workId: string;
  volumeId: string;
  chapterId?: string;
  defaultValues?: { title: string };
}

export function ChapterForm({
  action,
  submitLabel,
  workId,
  volumeId,
  chapterId,
  defaultValues,
}: ChapterFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="workId" value={workId} />
      <input type="hidden" name="volumeId" value={volumeId} />
      {chapterId ? <input type="hidden" name="id" value={chapterId} /> : null}

      <label className="flex flex-col gap-1 text-sm">
        章タイトル
        <input
          name="title"
          type="text"
          required
          maxLength={200}
          autoFocus
          defaultValue={defaultValues?.title ?? ""}
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
          href={`/works/${workId}/volumes/${volumeId}`}
          className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
