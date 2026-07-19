import Link from "next/link";
import { redirect } from "next/navigation";

import { listWorks } from "@/lib/db/works";
import { createClient } from "@/lib/supabase/server";
import { DeleteWorkButton } from "./delete-work-button";
import { WorksHeader } from "./works-header";

export default async function WorksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const works = await listWorks();

  return (
    <>
      <WorksHeader email={user.email} />

      <main className="mx-auto max-w-3xl px-6 py-12">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">作品</h1>
          <Link
            href="/works/new"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white"
          >
            新規作成
          </Link>
        </div>

        {works.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/20">
            <p className="text-sm text-black/60 dark:text-white/60">
              まだ作品がありません。最初の一作を植えましょう。
            </p>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {works.map((work) => (
              <li
                key={work.id}
                className="flex items-start justify-between gap-4 rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="min-w-0">
                  <div className="font-medium">{work.title}</div>
                  {work.synopsis ? (
                    <p className="mt-1 line-clamp-2 text-sm text-black/60 dark:text-white/60">
                      {work.synopsis}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/works/${work.id}/edit`}
                    className="rounded-md border border-black/15 px-3 py-1 text-sm dark:border-white/20"
                  >
                    編集
                  </Link>
                  <DeleteWorkButton workId={work.id} title={work.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}
