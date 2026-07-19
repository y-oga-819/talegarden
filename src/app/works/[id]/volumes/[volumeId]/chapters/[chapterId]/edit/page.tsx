import { notFound, redirect } from "next/navigation";

import { getChapter } from "@/lib/db/chapters";
import { createClient } from "@/lib/supabase/server";
import { updateChapterAction } from "@/lib/chapters/actions";
import { ChapterForm } from "../../../chapter-form";
import { WorksHeader } from "../../../../../../works-header";

export default async function EditChapterPage({
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

  const chapter = await getChapter(chapterId);
  // 他人の章・存在しない章、URL の巻 id と一致しない章はいずれも 404 扱いにする。
  if (!chapter || chapter.volumeId !== volumeId) {
    notFound();
  }

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight">
          章を編集
          <span className="ml-2 text-base font-normal text-black/50 dark:text-white/50">
            第{chapter.position}話
          </span>
        </h1>
        <ChapterForm
          action={updateChapterAction}
          submitLabel="保存"
          workId={id}
          volumeId={volumeId}
          chapterId={chapter.id}
          defaultValues={{ title: chapter.title }}
        />
      </main>
    </>
  );
}
