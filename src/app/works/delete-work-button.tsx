"use client";

import { deleteWorkAction } from "@/lib/works/actions";

export function DeleteWorkButton({ workId, title }: { workId: string; title: string }) {
  return (
    <form
      action={deleteWorkAction}
      onSubmit={(event) => {
        // 削除は不可逆（巻・章も連鎖削除）なので、送信前に必ず確認を挟む。
        if (!window.confirm(`「${title}」を削除しますか？この操作は取り消せません。`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={workId} />
      <button
        type="submit"
        className="rounded-md border border-red-500/40 px-3 py-1 text-sm text-red-600 dark:text-red-400"
      >
        削除
      </button>
    </form>
  );
}
