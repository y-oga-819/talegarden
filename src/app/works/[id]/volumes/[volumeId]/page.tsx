import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getVolume } from "@/lib/db/volumes";
import { listChapters } from "@/lib/db/chapters";
import { moveChapterAction } from "@/lib/chapters/actions";
import { createClient } from "@/lib/supabase/server";
import { DeleteChapterButton } from "./delete-chapter-button";
import { WorksHeader } from "../../../works-header";

export default async function VolumeDetailPage({
  params,
}: {
  params: Promise<{ id: string; volumeId: string }>;
}) {
  const { id, volumeId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const volume = await getVolume(volumeId);
  // 他人の巻・存在しない巻、URL の作品 id と一致しない巻はいずれも 404 扱いにする。
  if (!volume || volume.workId !== id) {
    notFound();
  }

  const chapters = await listChapters(volumeId);

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <Link
          href={`/works/${id}`}
          className="text-sm text-black/50 hover:underline dark:text-white/50"
        >
          ← 巻一覧
        </Link>

        <div className="mt-3 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-black/50 dark:text-white/50">
                第{volume.number}巻
              </span>{" "}
              {volume.title}
            </h1>
            {volume.summary ? (
              <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                {volume.summary}
              </p>
            ) : null}
          </div>
          <Link
            href={`/works/${id}/volumes/${volume.id}/edit`}
            className="shrink-0 rounded-md border border-black/15 px-3 py-1 text-sm dark:border-white/20"
          >
            巻を編集
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold">章</h2>
          <Link
            href={`/works/${id}/volumes/${volume.id}/chapters/new`}
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            章を追加
          </Link>
        </div>

        {chapters.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/20">
            <p className="text-sm text-black/60 dark:text-white/60">
              まだ章がありません。最初の一章から書き始めましょう。
            </p>
          </div>
        ) : (
          <ul className="mt-6 flex flex-col gap-3">
            {chapters.map((chapter, index) => (
              <li
                key={chapter.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="min-w-0">
                  <div className="font-medium">
                    <span className="text-black/50 dark:text-white/50">
                      第{chapter.position}話
                    </span>{" "}
                    {chapter.title}
                  </div>
                  <p className="mt-1 text-sm text-black/60 dark:text-white/60">
                    {chapter.wordCount.toLocaleString()} 文字
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <form action={moveChapterAction}>
                    <input type="hidden" name="workId" value={id} />
                    <input type="hidden" name="volumeId" value={volumeId} />
                    <input type="hidden" name="id" value={chapter.id} />
                    <input type="hidden" name="currentPosition" value={chapter.position} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      aria-label="上に移動"
                      className="rounded-md border border-black/15 px-2 py-1 text-sm disabled:opacity-30 dark:border-white/20"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveChapterAction}>
                    <input type="hidden" name="workId" value={id} />
                    <input type="hidden" name="volumeId" value={volumeId} />
                    <input type="hidden" name="id" value={chapter.id} />
                    <input type="hidden" name="currentPosition" value={chapter.position} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === chapters.length - 1}
                      aria-label="下に移動"
                      className="rounded-md border border-black/15 px-2 py-1 text-sm disabled:opacity-30 dark:border-white/20"
                    >
                      ↓
                    </button>
                  </form>
                  <Link
                    href={`/works/${id}/volumes/${volumeId}/chapters/${chapter.id}/edit`}
                    className="rounded-md border border-black/15 px-3 py-1 text-sm dark:border-white/20"
                  >
                    編集
                  </Link>
                  <DeleteChapterButton
                    workId={id}
                    volumeId={volumeId}
                    chapterId={chapter.id}
                    title={chapter.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
