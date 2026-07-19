"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { countCharacters } from "@/lib/domain/chapterBody";
import {
  updateChapterBodyAction,
  type ChapterBodyFormState,
} from "@/lib/chapters/actions";

const initialState: ChapterBodyFormState = {};

interface ManuscriptEditorProps {
  workId: string;
  volumeId: string;
  chapterId: string;
  defaultBody: string;
}

export function ManuscriptEditor({
  workId,
  volumeId,
  chapterId,
  defaultBody,
}: ManuscriptEditorProps) {
  const [state, formAction, pending] = useActionState(
    updateChapterBodyAction,
    initialState,
  );

  // 文字数はサーバと同じ数え方(空白を除く書記素)で即時表示する。保存済み値ではなく
  // 編集中の値を見せたいので、input を state で持って domain 関数で数える。
  const [text, setText] = useState(defaultBody);
  const liveCount = useMemo(() => countCharacters(text), [text]);

  // 「最後の保存内容と現在の本文が一致するか」で保存済み表示を出し分ける。保存後に
  // 一文字でも編集すれば差が出て表示が消えるため、余分な state や effect を持たずに済む。
  const isSaved = state.savedText !== undefined && state.savedText === text;

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="workId" value={workId} />
      <input type="hidden" name="volumeId" value={volumeId} />
      <input type="hidden" name="id" value={chapterId} />

      <textarea
        name="body"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="ここに本文を書きます。"
        className="min-h-[60vh] w-full resize-y rounded-md border border-black/15 px-4 py-3 font-serif text-base leading-8 dark:border-white/20 dark:bg-transparent"
      />

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-black/60 dark:text-white/60" aria-live="polite">
          {liveCount.toLocaleString()} 文字
          {isSaved ? (
            <span className="ml-2 text-emerald-600 dark:text-emerald-400">保存済み</span>
          ) : null}
        </p>
        <div className="flex gap-3">
          <Link
            href={`/works/${workId}/volumes/${volumeId}`}
            className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
          >
            巻へ戻る
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            {pending ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </form>
  );
}
