import { notFound, redirect } from "next/navigation";

import { getWork } from "@/lib/db/works";
import { createClient } from "@/lib/supabase/server";
import { createVolumeAction } from "@/lib/volumes/actions";
import { VolumeForm } from "../../volume-form";
import { WorksHeader } from "../../../works-header";

export default async function NewVolumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 存在しない・他人の作品配下で巻を作らせない（RLS の with check 前に UI で弾く）。
  const work = await getWork(id);
  if (!work) {
    notFound();
  }

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight">
          巻を追加
          <span className="ml-2 text-base font-normal text-black/50 dark:text-white/50">
            {work.title}
          </span>
        </h1>
        <VolumeForm action={createVolumeAction} submitLabel="追加" workId={work.id} />
      </main>
    </>
  );
}
