import { notFound, redirect } from "next/navigation";

import { getVolume } from "@/lib/db/volumes";
import { createClient } from "@/lib/supabase/server";
import { updateVolumeAction } from "@/lib/volumes/actions";
import { VolumeForm } from "../../../volume-form";
import { WorksHeader } from "../../../../works-header";

export default async function EditVolumePage({
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

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight">
          巻を編集
          <span className="ml-2 text-base font-normal text-black/50 dark:text-white/50">
            第{volume.number}巻
          </span>
        </h1>
        <VolumeForm
          action={updateVolumeAction}
          submitLabel="保存"
          workId={id}
          volumeId={volume.id}
          defaultValues={{ title: volume.title, summary: volume.summary ?? "" }}
        />
      </main>
    </>
  );
}
