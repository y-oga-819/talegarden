"use client";

import { deleteCharacterAction } from "@/lib/characters/actions";

export function DeleteCharacterButton({
  workId,
  characterId,
  name,
}: {
  workId: string;
  characterId: string;
  name: string;
}) {
  return (
    <form
      action={deleteCharacterAction}
      onSubmit={(event) => {
        // 削除は不可逆なので、送信前に必ず確認を挟む。
        if (!window.confirm(`「${name}」を削除しますか？この操作は取り消せません。`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="workId" value={workId} />
      <input type="hidden" name="id" value={characterId} />
      <button
        type="submit"
        className="rounded-md border border-red-500/40 px-3 py-1 text-sm text-red-600 dark:text-red-400"
      >
        削除
      </button>
    </form>
  );
}
