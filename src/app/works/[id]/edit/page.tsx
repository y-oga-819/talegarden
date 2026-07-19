import { notFound, redirect } from "next/navigation";

import { getWork } from "@/lib/db/works";
import { createClient } from "@/lib/supabase/server";
import { updateWorkAction } from "@/lib/works/actions";
import { WorkForm } from "../../work-form";
import { WorksHeader } from "../../works-header";

export default async function EditWorkPage({
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

  const work = await getWork(id);
  if (!work) {
    notFound();
  }

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="text-2xl font-bold tracking-tight">作品を編集</h1>
        <WorkForm
          action={updateWorkAction}
          submitLabel="保存"
          workId={work.id}
          defaultValues={{ title: work.title, synopsis: work.synopsis ?? "" }}
        />
      </main>
    </>
  );
}
