import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getChapterDetail } from "@/lib/db/chapters";
import { createClient } from "@/lib/supabase/server";
import { ManuscriptEditor } from "./manuscript-editor";
import { WorksHeader } from "../../../../../works-header";

export default async function ChapterEditorPage({
  params,
}: {
  params: Promise<{ id: string; volumeId: string; chapterId: string }>;
}) {
  const { id, volumeId, chapterId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const chapter = await getChapterDetail(chapterId);
  // 他人の章・存在しない章、URL の巻 id と一致しない章はいずれも 404 扱いにする。
  if (!chapter || chapter.volumeId !== volumeId) {
    notFound();
  }

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/works/${id}/volumes/${volumeId}`}
          className="text-sm text-black/50 hover:underline dark:text-white/50"
        >
          ← 章一覧
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4">
          <h1 className="min-w-0 text-2xl font-bold tracking-tight">
            <span className="text-black/50 dark:text-white/50">
              第{chapter.position}話
            </span>{" "}
            {chapter.title}
          </h1>
          <Link
            href={`/works/${id}/volumes/${volumeId}/chapters/${chapter.id}/edit`}
            className="shrink-0 rounded-md border border-black/15 px-3 py-1 text-sm dark:border-white/20"
          >
            タイトルを編集
          </Link>
        </div>

        <ManuscriptEditor
          workId={id}
          volumeId={volumeId}
          chapterId={chapter.id}
          defaultDoc={chapter.bodyDoc}
        />
      </main>
    </>
  );
}
