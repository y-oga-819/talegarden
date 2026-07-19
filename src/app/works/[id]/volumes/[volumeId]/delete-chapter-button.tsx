"use client";

import { deleteChapterAction } from "@/lib/chapters/actions";

export function DeleteChapterButton({
  workId,
  volumeId,
  chapterId,
  title,
}: {
  workId: string;
  volumeId: string;
  chapterId: string;
  title: string;
}) {
  return (
    <form
      action={deleteChapterAction}
      onSubmit={(event) => {
        // 削除は不可逆（本文も含めて消える）なので、送信前に必ず確認を挟む。
        if (!window.confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="workId" value={workId} />
      <input type="hidden" name="volumeId" value={volumeId} />
      <input type="hidden" name="id" value={chapterId} />
      <button
        type="submit"
        className="rounded-md border border-red-500/40 px-3 py-1 text-sm text-red-600 dark:text-red-400"
      >
        削除
      </button>
    </form>
  );
}
