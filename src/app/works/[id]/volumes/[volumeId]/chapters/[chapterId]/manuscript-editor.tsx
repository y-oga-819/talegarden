"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  EditorContent,
  useEditor,
  useEditorState,
  type JSONContent,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { countCharacters, type ProseMirrorDoc } from "@/lib/domain/chapterBody";
import {
  updateChapterBodyAction,
  type ChapterBodyFormState,
} from "@/lib/chapters/actions";

const initialState: ChapterBodyFormState = {};

interface ManuscriptEditorProps {
  workId: string;
  volumeId: string;
  chapterId: string;
  defaultDoc: ProseMirrorDoc;
}

/** ツールバー1ボタン。装飾の ON/OFF を色で示す。 */
function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`rounded-md border px-2.5 py-1 text-sm disabled:opacity-30 ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-black/15 dark:border-white/20"
      }`}
    >
      {label}
    </button>
  );
}

export function ManuscriptEditor({
  workId,
  volumeId,
  chapterId,
  defaultDoc,
}: ManuscriptEditorProps) {
  const [state, formAction, pending] = useActionState(
    updateChapterBodyAction,
    initialState,
  );

  const editor = useEditor({
    extensions: [StarterKit],
    // ProseMirrorDoc は content を unknown[] に留めているため、TipTap の JSONContent へ寄せる。
    content: defaultDoc as JSONContent,
    // Next の App Router では SSR 時に即時レンダーするとハイドレーション不整合になるため false。
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "tale-editor min-h-[60vh] rounded-md border border-black/15 px-4 py-3 font-serif text-base leading-8 dark:border-white/20",
      },
    },
  });

  // エディタの状態(現在の doc JSON・文字数・各装飾の ON/OFF)を選択的に購読する。
  // トランザクションのたびに再描画されるため、hidden input もツールバーも常に最新になる。
  const view = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      return {
        bodyJson: JSON.stringify(editor.getJSON()),
        // サーバの word_count と同じ数え方(空白を除く書記素)で即時表示する。
        charCount: countCharacters(editor.getText()),
        isBold: editor.isActive("bold"),
        isItalic: editor.isActive("italic"),
        isStrike: editor.isActive("strike"),
        isH2: editor.isActive("heading", { level: 2 }),
        isH3: editor.isActive("heading", { level: 3 }),
        isBlockquote: editor.isActive("blockquote"),
        isBulletList: editor.isActive("bulletList"),
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
      };
    },
  });

  const bodyJson = view?.bodyJson ?? JSON.stringify(defaultDoc);
  // 「最後の保存内容と現在の本文が一致するか」で保存済み表示を出し分ける。保存後に
  // 一文字でも編集すれば差が出て表示が消えるため、余分な state や effect を持たずに済む。
  const isSaved = state.savedBody !== undefined && state.savedBody === bodyJson;

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="workId" value={workId} />
      <input type="hidden" name="volumeId" value={volumeId} />
      <input type="hidden" name="id" value={chapterId} />
      <input type="hidden" name="body" value={bodyJson} />

      <div className="flex flex-wrap items-center gap-1.5">
        <ToolbarButton
          label="太字"
          active={view?.isBold}
          onClick={() => editor?.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          label="斜体"
          active={view?.isItalic}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          label="打消"
          active={view?.isStrike}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
        />
        <span className="mx-1 h-5 w-px bg-black/15 dark:bg-white/20" />
        <ToolbarButton
          label="見出し大"
          active={view?.isH2}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <ToolbarButton
          label="見出し小"
          active={view?.isH3}
          onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <ToolbarButton
          label="引用"
          active={view?.isBlockquote}
          onClick={() => editor?.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          label="箇条書き"
          active={view?.isBulletList}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          label="区切り"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
        />
        <span className="mx-1 h-5 w-px bg-black/15 dark:bg-white/20" />
        <ToolbarButton
          label="元に戻す"
          disabled={!view?.canUndo}
          onClick={() => editor?.chain().focus().undo().run()}
        />
        <ToolbarButton
          label="やり直す"
          disabled={!view?.canRedo}
          onClick={() => editor?.chain().focus().redo().run()}
        />
      </div>

      <EditorContent editor={editor} />

      {state.error ? (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-black/60 dark:text-white/60" aria-live="polite">
          {(view?.charCount ?? 0).toLocaleString()} 文字
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
