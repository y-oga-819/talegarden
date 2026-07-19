import { notFound, redirect } from "next/navigation";

import { getVolume } from "@/lib/db/volumes";
import { createClient } from "@/lib/supabase/server";
import { createChapterAction } from "@/lib/chapters/actions";
import { ChapterForm } from "../../chapter-form";
import { WorksHeader } from "../../../../../works-header";

export default async function NewChapterPage({
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

  // 存在しない・他人の巻配下で章を作らせない（RLS の with check 前に UI で弾く）。
  const volume = await getVolume(volumeId);
  if (!volume || volume.workId !== id) {
    notFound();
  }

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight">
          章を追加
          <span className="ml-2 text-base font-normal text-black/50 dark:text-white/50">
            第{volume.number}巻 {volume.title}
          </span>
        </h1>
        <ChapterForm
          action={createChapterAction}
          submitLabel="追加"
          workId={id}
          volumeId={volume.id}
        />
      </main>
    </>
  );
}
