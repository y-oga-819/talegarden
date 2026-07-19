"use client";

import Link from "next/link";
import { useActionState } from "react";

import type { WorkFormState } from "@/lib/works/actions";

const initialState: WorkFormState = {};

interface WorkFormProps {
  action: (prev: WorkFormState, formData: FormData) => Promise<WorkFormState>;
  submitLabel: string;
  workId?: string;
  defaultValues?: { title: string; synopsis: string };
}

export function WorkForm({ action, submitLabel, workId, defaultValues }: WorkFormProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      {workId ? <input type="hidden" name="id" value={workId} /> : null}

      <label className="flex flex-col gap-1 text-sm">
        タイトル
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

      <label className="flex flex-col gap-1 text-sm">
        あらすじ（任意）
        <textarea
          name="synopsis"
          rows={5}
          maxLength={4000}
          defaultValue={defaultValues?.synopsis ?? ""}
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
          href="/works"
          className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          キャンセル
        </Link>
      </div>
    </form>
  );
}
